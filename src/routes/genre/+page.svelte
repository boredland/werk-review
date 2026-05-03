<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Genres – Datenbank klassischer Literatur</title>
</svelte:head>

<h1>Genres</h1>

<div class="genre-grid">
	{#each data.genres as genre}
		<a href="/genre/{genre.slug}" class="genre-card">
			<span class="genre-name">{genre.name}</span>
			<span class="genre-count">{genre.workCount} {genre.workCount === 1 ? 'Werk' : 'Werke'}</span>
		</a>
	{/each}
</div>

<style>
	.genre-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.genre-card {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		transition: border-color 0.15s;
	}

	.genre-card:hover {
		border-color: var(--color-accent);
		text-decoration: none;
	}

	.genre-name {
		font-weight: 600;
		font-size: 1.1rem;
	}

	.genre-count {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}
</style>
