<script lang="ts">
	let { data } = $props();
	let filter = $state('');

	const filtered = $derived(
		filter
			? data.authors.filter(
					(a) =>
						a.name.toLowerCase().includes(filter.toLowerCase()) ||
						a.aliases.some((al) => al.toLowerCase().includes(filter.toLowerCase()))
				)
			: data.authors
	);
</script>

<svelte:head>
	<title>Autoren – Datenbank klassischer Literatur</title>
</svelte:head>

<h1>Autoren</h1>

<div class="filter-bar">
	<label for="author-filter" class="sr-only">Autoren filtern</label>
	<input
		id="author-filter"
		type="search"
		placeholder="Autor suchen…"
		bind:value={filter}
	/>
	<span class="count">{filtered.length} {filtered.length === 1 ? 'Autor' : 'Autoren'}</span>
</div>

<div class="author-list">
	{#each filtered as author}
		<a href="/autoren/{author.slug}" class="author-row">
			<span class="author-name">{author.name}</span>
			<span class="author-meta">
				{#if author.born || author.died}
					{author.born ?? '?'}–{author.died ?? '?'}
				{/if}
				<span class="work-count">{author.workCount} {author.workCount === 1 ? 'Werk' : 'Werke'}</span>
			</span>
		</a>
	{:else}
		<p class="empty">Keine Autoren gefunden.</p>
	{/each}
</div>

<style>
	.filter-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.filter-bar input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.95rem;
	}

	.filter-bar input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.count {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.author-list {
		display: flex;
		flex-direction: column;
	}

	.author-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.author-row:hover {
		text-decoration: none;
		color: var(--color-accent);
	}

	.author-name {
		font-weight: 600;
	}

	.author-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.work-count {
		color: var(--color-accent);
	}

	.empty {
		color: var(--color-text-muted);
		padding: 2rem 0;
	}
</style>
