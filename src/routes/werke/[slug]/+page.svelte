<script lang="ts">
	import { page } from '$app/state';
	import ReviewList from '$lib/components/reviews/ReviewList.svelte';
	import ReviewForm from '$lib/components/reviews/ReviewForm.svelte';

	let { data, form } = $props();

	const user = $derived(page.data.user);
</script>

<svelte:head>
	<title>{data.work.title} – Datenbank klassischer Literatur</title>
</svelte:head>

<article>
	<header class="work-header">
		<h1>{data.work.title}</h1>
		<div class="meta">
			{#if data.author}
				<a href="/autoren/{data.author.slug}">{data.author.name}</a>
			{/if}
			{#if data.genre}
				<span class="sep">&middot;</span>
				<a href="/genre/{data.genre.slug}">{data.genre.name}</a>
			{/if}
			<span class="sep">&middot;</span>
			<span>{data.work.year_display}</span>
		</div>
	</header>

	{#if data.work.collection_title}
		<p class="collection">Sammlung: {data.work.collection_title}</p>
	{/if}

	{#if data.work.plot}
		<section class="plot">
			<h2>Inhalt</h2>
			<p>{data.work.plot}</p>
		</section>
	{/if}

	{#if data.work.sources.length > 0}
		<section class="sources">
			<h3>Quellen</h3>
			<ul>
				{#each data.work.sources as source}
					<li><a href={source.url} target="_blank" rel="noopener">{source.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<ReviewList reviews={data.reviews} score={data.score} />

	{#if user}
		<ReviewForm userReview={data.userReview} {form} />
	{:else}
		<p class="login-hint">
			<a href="/login">Einloggen</a> oder <a href="/registrieren">registrieren</a>, um dieses Werk zu bewerten.
		</p>
	{/if}

	{#if data.similar.length > 0}
		<section class="similar">
			<h2>Ähnliche Werke</h2>
			<div class="similar-list">
				{#each data.similar as s}
					<a href="/werke/{s.slug}" class="similar-item">
						<span class="similar-title">{s.title}</span>
						<span class="similar-year">{s.year_display}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</article>

<style>
	.work-header {
		margin-bottom: 1.5rem;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 1rem;
		color: var(--color-text-muted);
		flex-wrap: wrap;
	}

	.sep {
		color: var(--color-border);
	}

	.collection {
		color: var(--color-text-muted);
		font-style: italic;
		margin-bottom: 1.5rem;
	}

	.plot {
		margin-bottom: 2rem;
		line-height: 1.7;
	}

	.sources {
		margin-bottom: 2rem;
	}

	.sources ul {
		list-style: none;
		padding: 0;
	}

	.sources li {
		padding: 0.25rem 0;
	}

	.login-hint {
		margin-top: 2rem;
		padding: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		text-align: center;
		color: var(--color-text-muted);
	}

	.similar {
		margin-top: 2.5rem;
	}

	.similar-list {
		display: flex;
		flex-direction: column;
	}

	.similar-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.similar-item:hover {
		text-decoration: none;
		color: var(--color-accent);
	}

	.similar-title {
		font-weight: 600;
	}

	.similar-year {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}
</style>
