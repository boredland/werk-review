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
		})
	);
</script>

<svelte:head>
	<title>Werke – Datenbank klassischer Literatur</title>
</svelte:head>

<h1>Werke</h1>

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
					{work.author_name} &middot; {work.genre_name}
				</span>
			</div>
			<span class="work-year">{work.year_display}</span>
		</a>
	{:else}
		<p class="empty">Keine Werke gefunden.</p>
	{/each}
</div>

<style>
	.filter-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.filter-bar input {
		flex: 1;
		min-width: 200px;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.95rem;
	}

	.filter-bar input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.filter-bar select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.95rem;
		background: var(--color-surface);
	}

	.count {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.work-list {
		display: flex;
		flex-direction: column;
	}

	.work-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.work-row:hover {
		text-decoration: none;
		color: var(--color-accent);
	}

	.work-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.work-title {
		font-weight: 600;
	}

	.work-meta {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.work-year {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.empty {
		color: var(--color-text-muted);
		padding: 2rem 0;
	}
</style>
