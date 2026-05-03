<script lang="ts">
let { data } = $props();

const photoKey = $derived(data.photoMeta?.r2Key ?? data.author.photo_r2_key);
const photoAlt = $derived(data.photoMeta?.description ?? data.author.name);
</script>

<svelte:head>
	<title>{data.author.name} – werk.review</title>
	<meta property="og:title" content="{data.author.name} – werk.review" />
	<meta property="og:description" content="{data.author.born ?? '?'}–{data.author.died ?? '?'} · {data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'}" />
	<meta property="og:type" content="profile" />
	{#if photoKey}
		<meta property="og:image" content="/images/{photoKey}" />
	{/if}
</svelte:head>

<article>
	<header class="author-header">
		{#if photoKey}
			<figure class="author-photo-figure">
				<img
					class="author-photo"
					src="/images/{photoKey}"
					alt={photoAlt}
				/>
				{#if data.photoMeta?.description || data.photoMeta?.sourceLabel}
					<figcaption class="photo-caption">
						{#if data.photoMeta.description}
							<span class="photo-desc">{data.photoMeta.description}</span>
						{/if}
						{#if data.photoMeta.sourceLabel}
							{#if data.photoMeta.sourceUrl}
								<a href={data.photoMeta.sourceUrl} target="_blank" rel="noopener" class="photo-source">{data.photoMeta.sourceLabel}</a>
							{:else}
								<span class="photo-source">{data.photoMeta.sourceLabel}</span>
							{/if}
						{/if}
					</figcaption>
				{/if}
			</figure>
		{:else}
			<div class="author-initial-large">{data.author.name.charAt(0)}</div>
		{/if}
		<div>
			<h1>{data.author.name}</h1>
			{#if data.author.born || data.author.died}
				<p class="years">{data.author.born ?? '?'}–{data.author.died ?? '?'}</p>
			{/if}
		</div>
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
		<h2>Werke <span class="works-count">({data.works.length})</span></h2>
		<div class="works-list">
			{#each data.works as work}
				<a href="/werke/{work.slug}" class="work-row">
					<div class="work-main">
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
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.author-photo-figure {
		margin: 0;
		flex-shrink: 0;
	}

	.author-photo {
		width: 5.5rem;
		height: 5.5rem;
		object-fit: cover;
		display: block;
		filter: grayscale(0.3) contrast(1.05);
	}

	.photo-caption {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		margin-top: 0.3rem;
		max-width: 5.5rem;
	}

	.photo-desc {
		font-family: var(--font-ui);
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.3;
	}

	.photo-source {
		font-family: var(--font-ui);
		font-size: 0.62rem;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	a.photo-source:hover {
		color: var(--color-accent);
		opacity: 1;
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

	.years {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 1rem;
		margin-top: 0.15rem;
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

	.works-section {
		margin-top: 2.5rem;
	}

	.works-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.works-list {
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

	.work-main {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
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

		.work-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
