<script lang="ts">
let { data } = $props();
</script>

<svelte:head>
	<title>{data.genre.name} – werk.review</title>
</svelte:head>

<div class="page-header">
	<h1>{data.genre.name}</h1>
	<p class="page-subtitle">{data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'}</p>
</div>

<div class="work-list">
	{#each data.works as work}
		<a href="/werke/{work.slug}" class="work-row">
			<div class="work-info">
				<span class="work-title">{work.title}</span>
				<span class="work-author">{work.author_name}</span>
			</div>
			<span class="work-year">{work.year_display}</span>
		</a>
	{/each}
</div>

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
