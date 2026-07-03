<script lang="ts">
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
import RatingBadge from '$lib/components/RatingBadge.svelte';

let { data } = $props();
let sortByRating = $state(false);

const sortedWorks = $derived(
	sortByRating
		? [...data.works].sort((a, b) => {
				const aR = a.reviewCount > 0;
				const bR = b.reviewCount > 0;
				if (aR !== bR) return aR ? -1 : 1;
				if (aR && bR) return b.totalPoints - a.totalPoints;
				return (a.year ?? 9999) - (b.year ?? 9999);
			})
		: data.works,
);

const jsonLd = $derived.by(() => {
	const absoluteImage = data.imageUrl
		? data.imageUrl.startsWith('http')
			? data.imageUrl
			: `https://werk.review${data.imageUrl}`
		: undefined;
	const person = {
		'@type': 'Person',
		name: data.author.name,
		birthDate: data.author.born?.toString(),
		deathDate: data.author.died?.toString(),
		description: data.author.bio || undefined,
		image: absoluteImage,
		url: `https://werk.review/autoren/${data.author.slug}`,
		sameAs: [data.wikiUrl].filter(Boolean),
		alternateName: data.author.aliases.length > 0 ? data.author.aliases : undefined,
	};
	const breadcrumbs = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Autoren',
				item: 'https://werk.review/autoren',
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: data.author.name,
				item: `https://werk.review/autoren/${data.author.slug}`,
			},
		],
	};
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [person, breadcrumbs],
	});
});
</script>

<svelte:head>
	<title>{data.author.name} – werk.review</title>
	<meta property="og:title" content="{data.author.name} – werk.review" />
	<meta property="og:description" content="{data.author.born ?? '?'}–{data.author.died ?? '?'} · {data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'}" />
	<meta property="og:type" content="profile" />
	{#if data.imageUrl}
		<meta property="og:image" content={data.imageUrl.startsWith('http') ? data.imageUrl : `https://werk.review${data.imageUrl}`} />
	{/if}

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Autoren', href: '/autoren' },
	{ label: data.author.name },
]} />

<article>
	<header class="author-header">
		{#if data.imageUrl}
			<img
				class="author-photo"
				src={data.imageUrl}
				alt={data.author.name}
			/>
		{:else}
			<div class="author-initial-large">{data.author.name.charAt(0)}</div>
		{/if}
		<div>
			<h1>{data.author.name}</h1>
			<div class="author-meta">
				{#if data.author.born || data.author.died}
					<p class="years">{data.author.born ?? '?'}–{data.author.died ?? '?'}</p>
				{/if}
				<RatingBadge avgRating={data.authorAvgRating} totalPoints={data.authorTotalPoints} reviewCount={data.authorReviewCount} />
			</div>
		</div>
	</header>

	{#if data.author.bio}
		<section class="bio">
			<p>{data.author.bio}</p>
			{#if data.author.source_note}
				<p class="source-note">{data.author.source_note}</p>
			{/if}
			<p class="wiki-link">
				<a href={data.wikiUrl} target="_blank" rel="noopener">Mehr auf Wikipedia ↗</a>
			</p>
		</section>
	{/if}

	<section class="works-section">
		<h2>Werke <span class="works-count">({data.works.length})</span></h2>
		<div class="works-controls">
			<button
				type="button"
				role="switch"
				aria-checked={sortByRating}
				class="sort-toggle"
				onclick={() => (sortByRating = !sortByRating)}
			>
				<span class="sort-toggle-label">Beste Bewertung</span>
				<span class="sort-toggle-track"><span class="sort-toggle-thumb"></span></span>
			</button>
		</div>
		<div class="works-list">
			{#each sortedWorks as work}
				<div class="work-row">
					<a href="/werke/{work.slug}" class="work-main">
						<span class="work-title">{work.title}</span>
						<span class="work-genre">{work.genre_name}</span>
					</a>
					{#if work.parentSeries}
						<a href="/werke/{work.parentSeries.slug}" class="work-series">
							<span class="series-prefix">aus dem Zyklus</span>
							<span class="series-title">{work.parentSeries.title}</span>
						</a>
					{/if}
					<div class="work-end">
						<RatingBadge avgRating={work.avgRating} totalPoints={work.totalPoints} reviewCount={work.reviewCount} />
						<span class="work-year">{work.year_display}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>
</article>

<style>
	.author-header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.author-photo {
		width: 5.5rem;
		height: 5.5rem;
		object-fit: cover;
		display: block;
		filter: grayscale(0.3) contrast(1.05);
		flex-shrink: 0;
	}

	.author-initial-large {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 600;
		color: var(--color-accent);
		width: 4.5rem;
		height: 4.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-light);
		flex-shrink: 0;
	}

	.author-header h1 {
		margin-bottom: 0;
	}

	.author-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.15rem;
	}

	.years {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 1rem;
		margin: 0;
	}

	.bio {
		margin-bottom: 2rem;
		line-height: 1.75;
		max-width: 720px;
		padding: 1.5rem;
		background: var(--color-surface);
		border-left: 3px solid var(--color-gold);
	}

	.bio p {
		margin: 0;
	}

	.source-note {
		margin-top: 0.75rem !important;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-style: italic;
		color: var(--color-text-muted);
	}

	.wiki-link {
		margin-top: 1rem !important;
		font-family: var(--font-ui);
		font-size: 0.9rem;
	}

	.wiki-link a {
		color: var(--color-gold);
		text-decoration: none;
		font-weight: 500;
	}

	.wiki-link a:hover {
		text-decoration: underline;
	}

	.works-section {
		margin-top: 2.5rem;
	}

	.works-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.works-controls {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.75rem;
	}

	.sort-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.sort-toggle-track {
		position: relative;
		width: 2.2rem;
		height: 1.2rem;
		border-radius: 999px;
		background: var(--color-border-light);
		transition: background 0.15s;
		flex-shrink: 0;
	}

	.sort-toggle-thumb {
		position: absolute;
		top: 0.15rem;
		left: 0.15rem;
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		transition: transform 0.15s;
	}

	.sort-toggle[aria-checked='true'] .sort-toggle-track {
		background: var(--color-accent);
	}

	.sort-toggle[aria-checked='true'] .sort-toggle-thumb {
		transform: translateX(1rem);
	}

	.works-list {
		display: flex;
		flex-direction: column;
	}

	.work-row {
		display: flex;
		gap: 1.25rem;
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

	.work-main {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex: 0 1 auto;
		min-width: 0;
		color: var(--color-text);
		text-decoration: none;
	}

	.work-main:hover {
		text-decoration: none;
	}

	.work-series {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-accent);
		text-decoration: none;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.work-series:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.series-prefix {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.work-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.work-genre {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		letter-spacing: 0.02em;
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
		.author-header {
			gap: 1rem;
		}

		.author-initial-large {
			font-size: 1.8rem;
			width: 3.5rem;
			height: 3.5rem;
		}

		.work-main {
			flex-direction: column;
			gap: 0.1rem;
		}

		.work-series {
			white-space: normal;
		}

		.work-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
