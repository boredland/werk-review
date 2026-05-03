<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Datenbank klassischer Literatur</title>
</svelte:head>

<section class="hero">
	<h1>Datenbank klassischer Literatur</h1>
	<p class="hero-sub">
		{data.authors.length} Autoren &middot; {data.totalWorks} Werke &middot; {data.genres.length} Genres
	</p>
</section>

<section class="section">
	<div class="section-header">
		<h2>Autoren</h2>
		<a href="/autoren">Alle anzeigen &rarr;</a>
	</div>
	<div class="author-grid">
		{#each data.authors.slice(0, 6) as author}
			<a href="/autoren/{author.slug}" class="author-card">
				<span class="author-name">{author.name}</span>
				{#if author.born || author.died}
					<span class="author-years">
						{author.born ?? '?'}–{author.died ?? '?'}
					</span>
				{/if}
			</a>
		{/each}
	</div>
</section>

<section class="section">
	<div class="section-header">
		<h2>Werke</h2>
		<a href="/werke">Alle anzeigen &rarr;</a>
	</div>
	<div class="work-grid">
		{#each data.recentWorks as work}
			<a href="/werke/{work.slug}" class="work-card">
				<span class="work-title">{work.title}</span>
				<span class="work-year">{work.year_display}</span>
			</a>
		{/each}
	</div>
</section>

<section class="section">
	<div class="section-header">
		<h2>Genres</h2>
		<a href="/genre">Alle anzeigen &rarr;</a>
	</div>
	<div class="genre-list">
		{#each data.genres as genre}
			<a href="/genre/{genre.slug}" class="genre-tag">{genre.name}</a>
		{/each}
	</div>
</section>

<style>
	.hero {
		text-align: center;
		padding: 2rem 0 1.5rem;
	}

	.hero h1 {
		margin-bottom: 0.5rem;
	}

	.hero-sub {
		color: var(--color-text-muted);
		font-size: 1.1rem;
	}

	.section {
		margin-bottom: 2.5rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}

	.section-header h2 {
		margin: 0;
	}

	.author-grid,
	.work-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.author-card,
	.work-card {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		transition: border-color 0.15s;
	}

	.author-card:hover,
	.work-card:hover {
		border-color: var(--color-accent);
		text-decoration: none;
	}

	.author-name,
	.work-title {
		font-weight: 600;
	}

	.author-years,
	.work-year {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.genre-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.genre-tag {
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		font-size: 0.9rem;
		color: var(--color-text);
	}

	.genre-tag:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		text-decoration: none;
	}
</style>
