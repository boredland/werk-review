<script lang="ts">
let { data } = $props();
</script>

<svelte:head>
	<title>Genres – werk.review</title>
</svelte:head>

<div class="page-header">
	<h1>Genres</h1>
	<p class="page-subtitle">{data.genres.length} Genres in der Datenbank</p>
</div>

<div class="genre-grid">
	{#each data.genres as genre, i}
		<a href="/genre/{genre.slug}" class="genre-card" style="animation: fadeUp 0.4s ease both; animation-delay: {0.05 + i * 0.05}s">
			<span class="genre-name">{genre.name}</span>
			<span class="genre-count">{genre.workCount} {genre.workCount === 1 ? 'Werk' : 'Werke'}</span>
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

	.genre-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.genre-card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.genre-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 12px rgba(123, 45, 59, 0.08);
		text-decoration: none;
	}

	.genre-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.2rem;
	}

	.genre-count {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-gold);
		font-weight: 500;
		margin-top: 0.35rem;
	}
</style>
