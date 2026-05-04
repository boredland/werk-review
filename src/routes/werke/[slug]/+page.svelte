<script lang="ts">
import { enhance } from '$app/forms';
import { page } from '$app/state';
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
import LibriVoxPlayer from '$lib/components/LibriVoxPlayer.svelte';
import ReviewForm from '$lib/components/reviews/ReviewForm.svelte';
import ReviewList from '$lib/components/reviews/ReviewList.svelte';

let { data, form } = $props();

const user = $derived(page.data.user);
let bookmarked = $state(data.isBookmarked);

const librivoxLinks = $derived(data.externalLinks.filter((l) => l.librivox_id));
const otherLinks = $derived(data.externalLinks.filter((l) => !l.librivox_id));

$effect(() => {
	bookmarked = data.isBookmarked;
});
</script>

<svelte:head>
	<title>{data.work.title} – werk.review</title>
	<meta property="og:title" content="{data.work.title} – werk.review" />
	<meta property="og:description" content="{data.author?.name ?? 'Unbekannt'} · {data.genre?.name ?? ''} · {data.work.year_display}" />
	<meta property="og:type" content="book" />
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Werke', href: '/werke' },
	{ label: data.work.title },
]} />

<article>
	<header class="work-header">
		<p class="work-kicker">{data.work.year_display}</p>
		<div class="work-title-row">
			<h1>{data.work.title}</h1>
			{#if user}
				<form method="POST" action="?/toggleBookmark" use:enhance={() => { bookmarked = !bookmarked; return async ({ update }) => { update({ reset: false }); }; }}>
					<button type="submit" class="bookmark-btn" class:bookmarked aria-label={bookmarked ? 'Von Leseliste entfernen' : 'Zur Leseliste hinzufügen'}>
						<svg width="20" height="20" viewBox="0 0 20 20" fill={bookmarked ? 'currentColor' : 'none'} aria-hidden="true">
							<path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
						</svg>
					</button>
				</form>
			{/if}
		</div>
		<div class="meta">
			{#if data.author}
				<a href="/autoren/{data.author.slug}" class="meta-link">{data.author.name}</a>
			{/if}
			{#if data.genre}
				<span class="meta-sep">·</span>
				<a href="/genre/{data.genre.slug}" class="meta-link meta-link--genre">{data.genre.name}</a>
			{/if}
		</div>
	</header>

	{#if data.work.collection_title}
		<p class="collection">Aus der Sammlung: <em>{data.work.collection_title}</em></p>
	{/if}

	{#if data.work.plot}
		<section class="plot">
			<h2>Inhalt</h2>
			<p>{data.work.plot}</p>
			{#if data.work.plot_source}
				<p class="plot-attribution">
					Quelle: <a href={data.work.plot_source.url} target="_blank" rel="noopener">{data.work.plot_source.label}</a>
					{#if data.work.plot_fetched_at}
						<span class="plot-date">· abgerufen am {new Date(data.work.plot_fetched_at).toLocaleDateString('de-DE')}</span>
					{/if}
				</p>
			{/if}
		</section>
	{/if}

	{#if data.externalLinks.length > 0}
		<section class="external-links">
			<h2>Lesen & Hören</h2>
			
			<div class="links-grid">
				{#if librivoxLinks.length > 0}
					{#each librivoxLinks as lv}
						<LibriVoxPlayer 
							librivoxId={lv.librivox_id!} 
							workTitles={[data.work.title, ...data.work.aliases]} 
						/>
					{/each}
				{/if}

				{#if otherLinks.length > 0}
					{#each otherLinks as link}
						<a href={link.url} target="_blank" rel="noopener" class="link-card">
							<span class="link-format">{link.format}</span>
							<span class="link-label">{link.label}</span>
							<span class="link-source">{link.source}</span>
						</a>
					{/each}
				{/if}
			</div>
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
		<div class="login-hint">
			<p><a href="/login">Anmelden</a> oder <a href="/registrieren">registrieren</a>, um dieses Werk zu bewerten.</p>
		</div>
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
	.work-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.work-title-row h1 {
		margin-bottom: 0.5rem;
	}

	.bookmark-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.bookmark-btn:hover {
		border-color: var(--color-gold);
		color: var(--color-gold);
	}

	.bookmark-btn.bookmarked {
		border-color: var(--color-gold);
		color: var(--color-gold);
	}

	.work-header {
		margin-bottom: 2rem;
	}

	.work-kicker {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-gold);
		margin-bottom: 0.35rem;
	}

	.work-header h1 {
		margin-bottom: 0.5rem;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.meta-link {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
	}

	.meta-link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.meta-link--genre {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.meta-link--genre:hover {
		color: var(--color-accent);
	}

	.meta-sep {
		color: var(--color-border);
	}

	.collection {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 2rem;
		padding: 0.75rem 1rem;
		background: var(--color-gold-light);
		border-left: 3px solid var(--color-gold);
	}

	.plot {
		margin-bottom: 2rem;
		line-height: 1.75;
		max-width: 720px;
	}

	.plot-attribution {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin-top: 0.75rem;
	}

	.plot-attribution a {
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.plot-attribution a:hover {
		color: var(--color-accent);
	}

	.plot-date {
		color: var(--color-text-muted);
	}

	.external-links {
		margin-bottom: 2rem;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.link-card {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.85rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		text-decoration: none;
		color: var(--color-text);
		transition: border-color 0.2s;
	}

	.link-card:hover {
		border-color: var(--color-accent);
		text-decoration: none;
	}

	.link-format {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.link-label {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.link-source {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
	}

	.sources {
		margin-bottom: 2rem;
	}

	.sources h3 {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.sources ul {
		list-style: none;
		padding: 0;
	}

	.sources li {
		padding: 0.3rem 0;
		font-size: 0.9rem;
	}

	.login-hint {
		margin-top: 2.5rem;
		padding: 1.25rem 1.5rem;
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-light);
		text-align: center;
	}

	.login-hint p {
		margin: 0;
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.similar {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.similar-list {
		display: flex;
		flex-direction: column;
	}

	.similar-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.65rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.similar-item:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.similar-title {
		font-family: var(--font-display);
		font-weight: 600;
	}

	.similar-year {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-gold);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.similar-item:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
