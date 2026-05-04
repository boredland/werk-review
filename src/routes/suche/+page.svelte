<script lang="ts">
import EmptyState from '$lib/components/EmptyState.svelte';

let { data } = $props();

const totalResults = $derived(data.authors.length + data.works.length + data.genres.length);
</script>

<svelte:head>
	<title>{data.query ? `Suche: ${data.query}` : 'Suche'} – werk.review</title>
</svelte:head>

<h1>Suche</h1>

{#if !data.query}
	<p class="hint">Gib einen Suchbegriff in das Suchfeld ein.</p>
{:else}
	<p class="result-summary">
		{totalResults} {totalResults === 1 ? 'Ergebnis' : 'Ergebnisse'} für „{data.query}"
	</p>

	{#if data.authors.length > 0}
		<section class="result-section">
			<h2>Autoren <span class="result-count">({data.authors.length})</span></h2>
			{#each data.authors as author}
				<a href="/autoren/{author.slug}" class="result-row">
					<span class="result-name">{author.name}</span>
				</a>
			{/each}
		</section>
	{/if}

	{#if data.works.length > 0}
		<section class="result-section">
			<h2>Werke <span class="result-count">({data.works.length})</span></h2>
			{#each data.works as work}
				<a href="/werke/{work.slug}" class="result-row">
					<span class="result-name">{work.title}</span>
					<span class="result-meta">{work.author_name} · {work.genre_name} · {work.year_display}</span>
				</a>
			{/each}
		</section>
	{/if}

	{#if data.genres.length > 0}
		<section class="result-section">
			<h2>Genres <span class="result-count">({data.genres.length})</span></h2>
			{#each data.genres as genre}
				<a href="/genre/{genre.slug}" class="result-row">
					<span class="result-name">{genre.name}</span>
				</a>
			{/each}
		</section>
	{/if}

	{#if totalResults === 0}
		<EmptyState icon="🔍" message="Keine Ergebnisse gefunden." />
	{/if}
{/if}

<style>
	.hint {
		color: var(--color-text-muted);
		padding: 2rem 0;
		text-align: center;
		font-style: italic;
	}

	.result-summary {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 2rem;
	}

	.result-section {
		margin-bottom: 2.5rem;
	}

	.result-section h2 {
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.6rem;
		margin-bottom: 0;
	}

	.result-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.result-row {
		display: flex;
		flex-direction: column;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.result-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.result-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.result-meta {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
		margin-top: 0.1rem;
	}

	@media (max-width: 640px) {
		.result-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
