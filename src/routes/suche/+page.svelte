<script lang="ts">
	let { data } = $props();

	const totalResults = $derived(data.authors.length + data.works.length + data.genres.length);
</script>

<svelte:head>
	<title>{data.query ? `Suche: ${data.query}` : 'Suche'} – Datenbank klassischer Literatur</title>
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
			<h2>Autoren ({data.authors.length})</h2>
			{#each data.authors as author}
				<a href="/autoren/{author.slug}" class="result-row">{author.name}</a>
			{/each}
		</section>
	{/if}

	{#if data.works.length > 0}
		<section class="result-section">
			<h2>Werke ({data.works.length})</h2>
			{#each data.works as work}
				<a href="/werke/{work.slug}" class="result-row">
					<span class="work-title">{work.title}</span>
					<span class="work-meta">{work.author_name} &middot; {work.genre_name} &middot; {work.year_display}</span>
				</a>
			{/each}
		</section>
	{/if}

	{#if data.genres.length > 0}
		<section class="result-section">
			<h2>Genres ({data.genres.length})</h2>
			{#each data.genres as genre}
				<a href="/genre/{genre.slug}" class="result-row">{genre.name}</a>
			{/each}
		</section>
	{/if}

	{#if totalResults === 0}
		<p class="empty">Keine Ergebnisse gefunden.</p>
	{/if}
{/if}

<style>
	.hint,
	.empty {
		color: var(--color-text-muted);
		padding: 2rem 0;
	}

	.result-summary {
		color: var(--color-text-muted);
		margin-bottom: 1.5rem;
	}

	.result-section {
		margin-bottom: 2rem;
	}

	.result-section h2 {
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.result-row {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.result-row:hover {
		text-decoration: none;
		color: var(--color-accent);
	}

	.work-title {
		font-weight: 600;
	}

	.work-meta {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}
</style>
