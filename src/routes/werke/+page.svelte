<script lang="ts">
let { data } = $props();
let filter = $state('');
let genreFilter = $state('');

const filtered = $derived(
	data.works.filter((w) => {
		if (genreFilter && w.genre_id !== genreFilter) return false;
		if (!filter) return true;
		const q = filter.toLowerCase();
		return (
			w.title.toLowerCase().includes(q) ||
			w.author_name.toLowerCase().includes(q) ||
			w.aliases.some((a) => a.toLowerCase().includes(q))
		);
	}),
);
</script>

<svelte:head>
	<title>Werke – werk.review</title>
</svelte:head>

<div class="page-header">
	<h1>Werke</h1>
	<p class="page-subtitle">{data.works.length} Werke in der Datenbank</p>
</div>

<div class="filter-bar">
	<label for="work-filter" class="sr-only">Werke filtern</label>
	<input
		id="work-filter"
		type="search"
		placeholder="Werk oder Autor suchen…"
		bind:value={filter}
	/>
	<select bind:value={genreFilter} aria-label="Genre filtern">
		<option value="">Alle Genres</option>
		{#each data.genres as genre}
			<option value={genre.id}>{genre.name}</option>
		{/each}
	</select>
	<span class="count">{filtered.length} {filtered.length === 1 ? 'Werk' : 'Werke'}</span>
</div>

<div class="work-list">
	{#each filtered as work}
		<a href="/werke/{work.slug}" class="work-row">
			<div class="work-info">
				<span class="work-title">{work.title}</span>
				<span class="work-meta">
					{work.author_name} · {work.genre_name}
				</span>
			</div>
			<span class="work-year">{work.year_display}</span>
		</a>
	{:else}
		<p class="empty">Keine Werke gefunden.</p>
	{/each}
</div>

<style>
	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-subtitle {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-top: -0.5rem;
	}

	.filter-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
		flex-wrap: wrap;
	}

	.filter-bar input {
		flex: 1;
		min-width: 200px;
		font-family: var(--font-ui);
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.filter-bar input::placeholder {
		color: var(--color-text-muted);
	}

	.filter-bar input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.filter-bar select {
		font-family: var(--font-ui);
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.filter-bar select:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.count {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.82rem;
		white-space: nowrap;
		letter-spacing: 0.02em;
	}

	.work-list {
		display: flex;
		flex-direction: column;
	}

	.work-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.work-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.work-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.work-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.work-meta {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
	}

	.work-year {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-gold);
		white-space: nowrap;
		font-weight: 500;
	}

	.empty {
		color: var(--color-text-muted);
		padding: 2rem 0;
		text-align: center;
		font-style: italic;
	}

	@media (max-width: 640px) {
		.work-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
