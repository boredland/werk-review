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
			<div class="result-grid">
				{#each data.authors as author, i}
					<a href="/autoren/{author.slug}" class="result-row result-row--author" style="animation: fadeUp 0.4s ease both; animation-delay: {0.1 + i * 0.04}s">
						{#if author.imageUrl}
							<img src={author.imageUrl} alt="" class="author-thumb" />
						{:else}
							<span class="author-initial">{author.name.charAt(0)}</span>
						{/if}
						<span class="result-name">{author.name}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.works.length > 0}
		<section class="result-section">
			<h2>Werke <span class="result-count">({data.works.length})</span></h2>
			<div class="result-grid">
				{#each data.works as work, i}
					<a href="/werke/{work.slug}" class="result-row" style="animation: fadeUp 0.4s ease both; animation-delay: {0.2 + i * 0.04}s">
						<span class="result-name">{work.title}</span>
						<span class="result-meta">{work.author_name} · {work.genre_name} · {work.year_display}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.genres.length > 0}
		<section class="result-section">
			<h2>Genres <span class="result-count">({data.genres.length})</span></h2>
			<div class="result-grid">
				{#each data.genres as genre, i}
					<a href="/genre/{genre.slug}" class="result-row" style="animation: fadeUp 0.4s ease both; animation-delay: {0.3 + i * 0.04}s">
						<span class="result-name">{genre.name}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if totalResults === 0}
		<EmptyState icon="🔍" message="Keine Ergebnisse gefunden." />
	{/if}
{/if}

<style>
	.hint {
		color: var(--color-text-muted);
		padding: 4rem 0;
		text-align: center;
		font-style: italic;
		animation: fadeUp 0.5s ease both;
	}

	.result-summary {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 2.5rem;
		animation: fadeUp 0.5s ease both;
	}

	.result-section {
		margin-bottom: 3rem;
	}

	.result-section h2 {
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.75rem;
		margin-bottom: 0.5rem;
		font-size: 1.4rem;
	}

	.result-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.result-grid {
		display: flex;
		flex-direction: column;
	}

	.result-row {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: all 0.2s;
	}

	.result-row--author {
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}

	.author-thumb {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		filter: grayscale(0.2);
		border-radius: 2px;
	}

	.author-initial {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-light);
		color: var(--color-accent);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.2rem;
	}

	.result-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -1rem;
		padding-left: 1rem;
		padding-right: 1rem;
		transform: translateX(4px);
	}

	.result-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.1rem;
	}

	.result-meta {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-top: 0.2rem;
	}

	@media (max-width: 640px) {
		.result-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
			transform: none;
		}
	}
</style>
