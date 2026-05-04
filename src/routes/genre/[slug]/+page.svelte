<script lang="ts">
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
import Pagination from '$lib/components/Pagination.svelte';
import RatingBadge from '$lib/components/RatingBadge.svelte';

const PAGE_SIZE = 20;

let { data } = $props();
let sortBy = $state<'year' | 'title' | 'rating'>('year');
let currentPage = $state(1);

const sorted = $derived(
	[...data.works].sort((a, b) => {
		if (sortBy === 'title') return a.title.localeCompare(b.title, 'de');
		if (sortBy === 'rating')
			return (
				(b.avgRating ?? -Infinity) - (a.avgRating ?? -Infinity) || b.reviewCount - a.reviewCount
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
	<title>{data.genre.name} – werk.review</title>
	<meta property="og:title" content="{data.genre.name} – werk.review" />
	<meta property="og:description" content="{data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'} im Genre {data.genre.name}" />
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Genres', href: '/genre' },
	{ label: data.genre.name },
]} />

<div class="page-header">
	<h1>{data.genre.name}</h1>
	<p class="page-subtitle">{data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'}</p>
</div>

<div class="sort-bar">
	<select bind:value={sortBy} aria-label="Sortierung">
		<option value="year">Jahr</option>
		<option value="title">Titel A–Z</option>
		<option value="rating">Bewertung</option>
	</select>
</div>

<div class="work-list">
	{#each paginated as work}
		<a href="/werke/{work.slug}" class="work-row">
			<div class="work-info">
				<span class="work-title">{work.title}</span>
				<span class="work-author">{work.author_name}</span>
			</div>
			<div class="work-end">
				<RatingBadge avgRating={work.avgRating} reviewCount={work.reviewCount} />
				<span class="work-year">{work.year_display}</span>
			</div>
		</a>
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

	.sort-bar {
		display: flex;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.sort-bar select {
		font-family: var(--font-ui);
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.sort-bar select:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
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

	.work-author {
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
