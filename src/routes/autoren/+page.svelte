<script lang="ts">
import EmptyState from '$lib/components/EmptyState.svelte';
import Pagination from '$lib/components/Pagination.svelte';

const PAGE_SIZE = 20;

let { data } = $props();
let filter = $state('');
let sortBy = $state<'rank' | 'name' | 'born' | 'works'>('rank');
let currentPage = $state(1);

const filtered = $derived(
	filter
		? data.authors.filter(
				(a) =>
					a.name.toLowerCase().includes(filter.toLowerCase()) ||
					a.aliases.some((al) => al.toLowerCase().includes(filter.toLowerCase())),
			)
		: data.authors,
);

const sorted = $derived(
	[...filtered].sort((a, b) => {
		if (sortBy === 'rank') return a.rank - b.rank || a.name.localeCompare(b.name, 'de');
		if (sortBy === 'born') return (a.born ?? 9999) - (b.born ?? 9999);
		if (sortBy === 'works') return b.workCount - a.workCount;
		return a.name.localeCompare(b.name, 'de');
	}),
);

$effect(() => {
	sorted.length;
	currentPage = 1;
});

const totalPages = $derived(Math.ceil(sorted.length / PAGE_SIZE));
const paginated = $derived(sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
</script>

<svelte:head>
	<title>Autoren – werk.review</title>
</svelte:head>

<div class="page-header">
	<h1>Autoren</h1>
	<p class="page-subtitle">{data.authors.length} Autoren in der Datenbank</p>
</div>

<div class="filter-bar">
	<label for="author-filter" class="sr-only">Autoren filtern</label>
	<input
		id="author-filter"
		type="search"
		placeholder="Autor suchen…"
		bind:value={filter}
	/>
	<select bind:value={sortBy} aria-label="Sortierung">
		<option value="rank">Nach Rang</option>
		<option value="name">Name A–Z</option>
		<option value="born">Geburtsjahr</option>
		<option value="works">Anzahl Werke</option>
	</select>
	<span class="count">{filtered.length} {filtered.length === 1 ? 'Autor' : 'Autoren'}</span>
</div>

<div class="author-list">
	{#each paginated as author}
		<a href="/autoren/{author.slug}" class="author-row">
			<span class="author-rank">{author.rank}.</span>
			{#if author.imageUrl}
				<img class="author-thumb" src={author.imageUrl} alt="" />
			{:else}
				<span class="author-initial">{author.name.charAt(0)}</span>
			{/if}
			<div class="author-main">
				<span class="author-name">{author.name}</span>
				{#if author.born || author.died}
					<span class="author-years">{author.born ?? '?'}–{author.died ?? '?'}</span>
				{/if}
			</div>
			<div class="author-stats">
				<span class="stat-badge">{author.recommendations} {author.recommendations === 1 ? 'Empfehlung' : 'Empfehlungen'}</span>
				<span class="work-count">{author.workCount} {author.workCount === 1 ? 'Werk' : 'Werke'}</span>
			</div>
		</a>
	{:else}
		<EmptyState icon="🖋️" message="Keine Autoren gefunden." />
	{/each}
</div>

<Pagination {currentPage} {totalPages} onPageChange={(p) => currentPage = p} />

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

	.filter-bar input {
		flex: 1;
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

	.count {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.82rem;
		white-space: nowrap;
		letter-spacing: 0.02em;
	}

	.author-list {
		display: flex;
		flex-direction: column;
	}

	.author-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.author-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.author-thumb {
		width: 2rem;
		height: 2rem;
		object-fit: cover;
		flex-shrink: 0;
		filter: grayscale(0.3);
	}

	.author-initial {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-accent);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-light);
		flex-shrink: 0;
	}

	.author-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.author-years {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.author-rank {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-gold);
		min-width: 2rem;
		text-align: right;
		margin-right: 0.5rem;
	}

	.author-stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.stat-badge {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-accent);
		background: var(--color-accent-light);
		padding: 0.15rem 0.5rem;
		border-radius: 12px;
		white-space: nowrap;
	}

	.work-count {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.author-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
