<script lang="ts">
import EmptyState from '$lib/components/EmptyState.svelte';
import Pagination from '$lib/components/Pagination.svelte';
import RatingBadge from '$lib/components/RatingBadge.svelte';

const PAGE_SIZE = 20;

let { data } = $props();
let filter = $state('');
let genreFilter = $state('');
let sortBy = $state<'year' | 'title' | 'rating'>('year');
let currentPage = $state(1);

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

const sorted = $derived(
	[...filtered].sort((a, b) => {
		if (sortBy === 'title') return a.title.localeCompare(b.title, 'de');
		if (sortBy === 'rating')
			return (
				(b.totalPoints ?? -Infinity) - (a.totalPoints ?? -Infinity) || b.reviewCount - a.reviewCount
			);
		return (a.year_from ?? 9999) - (b.year_from ?? 9999);
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
	<select bind:value={sortBy} aria-label="Sortierung">
		<option value="year">Jahr</option>
		<option value="title">Titel A–Z</option>
		<option value="rating">Bewertung</option>
	</select>
	<span class="count">{filtered.length} {filtered.length === 1 ? 'Werk' : 'Werke'}</span>
</div>

<div class="work-list">
	{#each paginated as work}
		<a href="/werke/{work.slug}" class="work-row">
			<div class="work-info">
				<span class="work-title">{work.title}</span>
				<span class="work-meta">
					{work.author_name} · {work.genre_name}
				</span>
			</div>
			<div class="work-end">
				<RatingBadge avgRating={work.avgRating} totalPoints={work.totalPoints} reviewCount={work.reviewCount} />
				<span class="work-year">{work.year_display}</span>
			</div>
		</a>
	{:else}
		<EmptyState icon="📚" message="Keine Werke gefunden." />
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
		transition: all 0.2s;
	}

	.work-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		transform: translateX(4px);
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

	.work-end {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.work-year {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-gold);
		white-space: nowrap;
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.work-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
