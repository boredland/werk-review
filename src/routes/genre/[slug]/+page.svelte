<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.genre.name} – Datenbank klassischer Literatur</title>
</svelte:head>

<h1>{data.genre.name}</h1>
<p class="subtitle">{data.works.length} {data.works.length === 1 ? 'Werk' : 'Werke'}</p>

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
	.subtitle {
		color: var(--color-text-muted);
		margin-top: -0.5rem;
		margin-bottom: 1.5rem;
	}

	.work-list {
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

	.work-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.work-title {
		font-weight: 600;
	}

	.work-author {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.work-year {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
</style>
