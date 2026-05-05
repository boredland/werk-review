<script lang="ts">
import { enhance } from '$app/forms';
import { page } from '$app/state';
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
import LibriVoxPlayer from '$lib/components/LibriVoxPlayer.svelte';
import ReviewForm from '$lib/components/reviews/ReviewForm.svelte';
import ReviewList from '$lib/components/reviews/ReviewList.svelte';

let { data, form } = $props();

const user = $derived(page.data.user);
let bookmarked = $state(data.isBookmarked);
let isRead = $state(data.isRead);

const librivoxLinks = $derived(data.externalLinks.filter((l) => l.librivox_id));
const otherLinks = $derived(data.externalLinks.filter((l) => !l.librivox_id));

$effect(() => {
	bookmarked = data.isBookmarked;
	isRead = data.isRead;
});
</script>

<svelte:head>
	<title>{data.work.title} – werk.review</title>
	<meta property="og:title" content="{data.work.title} – werk.review" />
	<meta property="og:description" content="{data.author?.name ?? 'Unbekannt'} · {data.genres.map(g => g.name).join(', ')} · {data.work.year_display}" />
	<meta property="og:type" content="book" />

	<!-- Structured Data (JSON-LD) -->
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Book',
			name: data.work.title,
			author: data.author
				? {
						'@type': 'Person',
						name: data.author.name,
					}
				: undefined,
			datePublished: data.work.year_from?.toString(),
			genre: data.genres.map(g => g.name).join(', '),
			description: data.work.plot || undefined,
			aggregateRating: data.score
				? {
						'@type': 'AggregateRating',
						ratingValue: data.reviews.reduce((acc, r) => acc + r.rating, 0) / data.reviews.length || undefined,
						reviewCount: data.reviews.length,
						bestRating: 3,
						worstRating: -3,
					}
				: undefined,
		})}
	</script>
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Werke', href: '/werke' },
	{ label: data.work.title },
]} />

<article>
	<header class="work-header">
		<p class="work-kicker">{data.work.year_display}</p>
		<div class="work-title-row">
			<h1>{data.work.title}</h1>
			{#if user}
				<div class="action-buttons">
					<form method="POST" action="?/toggleRead" use:enhance={() => { isRead = !isRead; return async ({ update }) => { update({ reset: false }); }; }}>
						<button type="submit" class="action-btn" class:active={isRead} aria-label={isRead ? 'Als ungelesen markieren' : 'Als gelesen markieren'} title="Gelesen">
							<svg width="20" height="20" viewBox="0 0 20 20" fill={isRead ? 'currentColor' : 'none'} aria-hidden="true">
								<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</form>
					<form method="POST" action="?/toggleBookmark" use:enhance={() => { bookmarked = !bookmarked; return async ({ update }) => { update({ reset: false }); }; }}>
						<button type="submit" class="action-btn" class:active={bookmarked} aria-label={bookmarked ? 'Von Leseliste entfernen' : 'Zur Leseliste hinzufügen'} title="Lesezeichen">
							<svg width="20" height="20" viewBox="0 0 20 20" fill={bookmarked ? 'currentColor' : 'none'} aria-hidden="true">
								<path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
							</svg>
						</button>
					</form>
				</div>
			{/if}
		</div>
		<div class="meta">
			{#if data.author}
				<a href="/autoren/{data.author.slug}" class="meta-link">{data.author.name}</a>
			{/if}
			{#if data.genres.length > 0}
				<span class="meta-sep">·</span>
				{#each data.genres as g, i}
					<a href="/genre/{g.slug}" class="meta-link meta-link--genre">{g.name}</a>{#if i < data.genres.length - 1}<span class="meta-sep">, </span>{/if}
				{/each}
			{/if}
		</div>
	</header>

	{#if data.parentWorks.length > 0}
		<p class="collection">
			Aus der Sammlung:
			{#each data.parentWorks as pw, i}
				<a href="/werke/{pw.slug}"><em>{pw.title}</em></a>{#if i < data.parentWorks.length - 1}<span>, </span>{/if}
			{/each}
		</p>
	{/if}

	{#if data.childWorks.length > 0}
		<section class="child-works">
			<h2>In dieser Sammlung</h2>
			<div class="similar-list">
				{#each data.childWorks as cw}
					<a href="/werke/{cw.slug}" class="similar-item">
						<span class="similar-title">{cw.title}</span>
						<span class="similar-year">{cw.year_display}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}


	{#if data.work.plot}
		<section class="plot">
			<h2>Inhalt</h2>
			<p>{data.work.plot}</p>
			{#if data.work.plot_source}
				<p class="plot-attribution">
					Quelle: <a href={data.work.plot_source.url} target="_blank" rel="noopener">{data.work.plot_source.label}</a>
					{#if data.work.plot_fetched_at}
						<span class="plot-date">· abgerufen am {new Date(data.work.plot_fetched_at).toLocaleDateString('de-DE')}</span>
					{/if}
				</p>
			{/if}
		</section>
	{/if}

	{#if data.externalLinks.length > 0}
		<section class="external-links">
			<h2>Lesen & Hören</h2>
			
			<div class="links-grid">
				{#if librivoxLinks.length > 0}
					{#each librivoxLinks as lv}
						<LibriVoxPlayer 
							librivoxId={lv.librivox_id!} 
							workTitles={[data.work.title, ...data.work.aliases]} 
						/>
					{/each}
				{/if}

				{#if otherLinks.length > 0}
					{#each otherLinks as link}
						<div class="link-card">
							<div class="link-card-main">
								<span class="link-format">{link.format}</span>
								<a href={link.url} target="_blank" rel="noopener" class="link-title">
									{link.label}
								</a>
								<div class="link-formats">
									<span class="format-tag">Online lesen</span>
									{#if link.formats}
										{#each link.formats as f}
											<span class="format-tag">{f.replace('Text PDF', 'PDF')}</span>
										{/each}
									{/if}
								</div>
							</div>
							<div class="link-card-actions">
								<a href={link.url} target="_blank" rel="noopener" class="source-link">
									↗ {link.source}
								</a>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	{/if}

	{#if data.work.sources.length > 0}
		<section class="sources">
			<h3>Quellen</h3>
			<ul>
				{#each data.work.sources as source}
					<li><a href={source.url} target="_blank" rel="noopener">{source.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<ReviewList reviews={data.reviews} score={data.score} />

	{#if user}
		<ReviewForm userReview={data.userReview} {form} />
	{:else}
		<div class="login-hint">
			<p><a href="/login">Anmelden</a> oder <a href="/registrieren">registrieren</a>, um dieses Werk zu bewerten.</p>
		</div>
	{/if}

	{#if data.similar.length > 0}
		<section class="similar">
			<h2>Ähnliche Werke</h2>
			<div class="similar-list">
				{#each data.similar as s}
					<a href="/werke/{s.slug}" class="similar-item">
						<span class="similar-title">{s.title}</span>
						<span class="similar-year">{s.year_display}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</article>

<style>
	.work-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.work-title-row h1 {
		margin-bottom: 0.5rem;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.action-btn:hover {
		border-color: var(--color-gold);
		color: var(--color-gold);
	}

	.action-btn.active {
		border-color: var(--color-gold);
		color: var(--color-gold);
	}

	.work-header {
		margin-bottom: 2rem;
	}

	.work-kicker {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-gold);
		margin-bottom: 0.35rem;
	}

	.work-header h1 {
		margin-bottom: 0.5rem;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.meta-link {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
	}

	.meta-link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.meta-link--genre {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.meta-link--genre:hover {
		color: var(--color-accent);
	}

	.meta-sep {
		color: var(--color-border);
	}

	.collection {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 2rem;
		padding: 0.75rem 1rem;
		background: var(--color-gold-light);
		border-left: 3px solid var(--color-gold);
	}

	.child-works {
		margin-bottom: 2rem;
	}

	.plot {
		margin-bottom: 2rem;
		line-height: 1.75;
		max-width: 720px;
	}

	.plot-attribution {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin-top: 0.75rem;
	}

	.plot-attribution a {
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.plot-attribution a:hover {
		color: var(--color-accent);
	}

	.plot-date {
		color: var(--color-text-muted);
	}

	.external-links {
		margin-bottom: 2rem;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 0.75rem;
	}

	.link-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 4px;
		color: var(--color-text);
		transition: border-color 0.2s;
		gap: 1rem;
	}
	
	.link-card:hover {
		border-color: var(--color-accent);
	}

	.link-card-main {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.link-format {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-gold);
		margin-bottom: 0.1rem;
	}

	.link-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.link-title:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.link-formats {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.2rem;
	}

	.format-tag {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		color: var(--color-text-muted);
		background: var(--color-surface-warm);
		padding: 0.1rem 0.4rem;
		border-radius: 2px;
		border: 1px solid var(--color-border-light);
	}

	.link-card-actions {
		flex-shrink: 0;
	}

	.source-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-decoration: none;
		white-space: nowrap;
	}

	.source-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.sources {
		margin-bottom: 2rem;
	}

	.sources h3 {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.sources ul {
		list-style: none;
		padding: 0;
	}

	.sources li {
		padding: 0.3rem 0;
		font-size: 0.9rem;
	}

	.login-hint {
		margin-top: 2.5rem;
		padding: 1.25rem 1.5rem;
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-light);
		text-align: center;
	}

	.login-hint p {
		margin: 0;
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.similar {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.similar-list {
		display: flex;
		flex-direction: column;
	}

	.similar-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.65rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.similar-item:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.similar-title {
		font-family: var(--font-display);
		font-weight: 600;
	}

	.similar-year {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-gold);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.similar-item:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
