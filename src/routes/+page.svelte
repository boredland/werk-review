<script lang="ts">
import RatingBadge from '$lib/components/RatingBadge.svelte';

let { data } = $props();
</script>

<svelte:head>
	<title>werk.review – Datenbank klassischer Literatur</title>
	<meta property="og:title" content="werk.review – Datenbank klassischer Literatur" />
	<meta property="og:description" content="{data.totalAuthors} Autoren, {data.totalWorks} Werke, {data.genres.length} Genres – Entdecke die Meisterwerke der deutschen Literatur" />
</svelte:head>

<section class="hero">
	<h1>Willkommen werter Suchender,</h1>
	<p class="hero-welcome">
		diese Website ist eine Datenbank der klassischen Literatur. Bibliothekarisch sind hier die wichtigsten klassischen Autoren mit all ihren Werken eingepflegt, welche in deutscher Sprache erhältlich sind.
	</p>
	<div class="hero-stats">
		<div class="stat">
			<span class="stat-number">{data.totalAuthors}</span>
			<span class="stat-label">Autoren</span>
		</div>
		<span class="stat-divider"></span>
		<div class="stat">
			<span class="stat-number">{data.totalWorks}</span>
			<span class="stat-label">Werke</span>
		</div>
		<span class="stat-divider"></span>
		<div class="stat">
			<span class="stat-number">{data.genres.length}</span>
			<span class="stat-label">Genres</span>
		</div>
	</div>
</section>

<section class="section" style="animation: fadeUp 0.5s ease both; animation-delay: 0.1s">
	<div class="section-header">
		<h2>Autoren</h2>
		<a href="/autoren" class="section-link">Alle anzeigen</a>
	</div>
	<div class="author-grid">
		{#each data.authors as author, i}
			<a href="/autoren/{author.slug}" class="author-card" style="animation: fadeUp 0.4s ease both; animation-delay: {0.15 + i * 0.06}s">
				{#if author.imageUrl}
					<img class="author-thumb" src={author.imageUrl} alt="" />
				{:else}
					<span class="author-initial">{author.name.charAt(0)}</span>
				{/if}
				<div class="author-info">
					<span class="author-name">{author.name}</span>
					{#if author.born || author.died}
						<span class="author-years">
							{author.born ?? '?'}–{author.died ?? '?'}
						</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</section>

<section class="section" style="animation: fadeUp 0.5s ease both; animation-delay: 0.25s">
	<div class="section-header">
		<h2>Werke</h2>
		<a href="/werke" class="section-link">Alle anzeigen</a>
	</div>
	<div class="work-grid">
		{#each data.recentWorks as work, i}
			<a href="/werke/{work.slug}" class="work-card" style="animation: fadeUp 0.4s ease both; animation-delay: {0.3 + i * 0.06}s">
				<span class="work-year-badge">{work.year_display}</span>
				<span class="work-title">{work.title}</span>
				<RatingBadge avgRating={work.avgRating} totalPoints={work.totalPoints} reviewCount={work.reviewCount} />
			</a>
		{/each}
	</div>
</section>

<section class="section" style="animation: fadeUp 0.5s ease both; animation-delay: 0.4s">
	<div class="section-header">
		<h2>Genres</h2>
		<a href="/genre" class="section-link">Alle anzeigen</a>
	</div>
	<div class="genre-list">
		{#each data.genres as genre}
			<a href="/genre/{genre.slug}" class="genre-pill">{genre.name}</a>
		{/each}
	</div>
</section>

<style>
	.hero {
		text-align: center;
		padding: 3rem 0 2.5rem;
	}

	.hero-welcome {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		max-width: 600px;
		margin: 0 auto 2rem;
	}

	.hero h1 {
		font-size: 2.8rem;
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-number {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-accent);
		line-height: 1;
	}

	.stat-label {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.stat-divider {
		width: 1px;
		height: 2.5rem;
		background: var(--color-border);
	}

	.section {
		margin-bottom: 3rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-border);
	}

	.section-header h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.section-link {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--color-accent);
		text-decoration: none;
		transition: color 0.2s;
	}

	.section-link:hover {
		color: var(--color-accent-hover);
		text-decoration: none;
	}

	.author-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.75rem;
	}

	.author-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.author-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 12px rgba(123, 45, 59, 0.08);
		text-decoration: none;
	}

	.author-thumb {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		flex-shrink: 0;
		filter: grayscale(0.3);
	}

	.author-initial {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--color-accent);
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-light);
		flex-shrink: 0;
	}

	.author-info {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
	}

	.author-years {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-top: 0.1rem;
	}

	.work-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.work-card {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.work-card:hover {
		border-color: var(--color-gold);
		box-shadow: 0 2px 12px rgba(184, 150, 62, 0.1);
		text-decoration: none;
	}

	.work-year-badge {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-gold);
		margin-bottom: 0.5rem;
	}

	.work-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.genre-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.genre-pill {
		font-family: var(--font-ui);
		padding: 0.45rem 1.1rem;
		border: 1px solid var(--color-border);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		transition: all 0.2s;
	}

	.genre-pill:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: var(--color-accent-light);
		text-decoration: none;
	}

	@media (max-width: 640px) {
		.hero {
			padding: 2rem 0 1.5rem;
		}

		.hero h1 {
			font-size: 2rem;
		}

		.hero-stats {
			gap: 1.25rem;
		}

		.stat-number {
			font-size: 1.5rem;
		}

		.author-grid {
			grid-template-columns: 1fr;
		}

		.work-grid {
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		}
	}
</style>
