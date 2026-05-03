<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.author.name} – Datenbank klassischer Literatur</title>
</svelte:head>

<article>
	<header class="author-header">
		<h1>{data.author.name}</h1>
		{#if data.author.born || data.author.died}
			<p class="years">{data.author.born ?? '?'}–{data.author.died ?? '?'}</p>
		{/if}
	</header>

	{#if data.author.bio}
		<section class="bio">
			<p>{data.author.bio}</p>
		</section>
	{/if}

	{#if data.author.sources.length > 0}
		<section class="sources">
			<h3>Quellen</h3>
			<ul>
				{#each data.author.sources as source}
					<li><a href={source.url} target="_blank" rel="noopener">{source.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="works-section">
		<h2>Werke ({data.works.length})</h2>
		<div class="works-list">
			{#each data.works as work}
				<a href="/werke/{work.slug}" class="work-row">
					<div>
						<span class="work-title">{work.title}</span>
						<span class="work-genre">{work.genre_name}</span>
					</div>
					<span class="work-year">{work.year_display}</span>
				</a>
			{/each}
		</div>
	</section>
</article>

<style>
	.author-header {
		margin-bottom: 1.5rem;
	}

	.years {
		color: var(--color-text-muted);
		font-size: 1.1rem;
		margin-top: 0.25rem;
	}

	.bio {
		margin-bottom: 2rem;
		line-height: 1.7;
	}

	.sources {
		margin-bottom: 2rem;
	}

	.sources ul {
		list-style: none;
		padding: 0;
	}

	.sources li {
		padding: 0.25rem 0;
	}

	.works-section {
		margin-top: 2rem;
	}

	.works-list {
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

	.work-title {
		font-weight: 600;
	}

	.work-genre {
		margin-left: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.work-year {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
</style>
