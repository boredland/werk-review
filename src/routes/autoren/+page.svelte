<script lang="ts">
let { data } = $props();
let filter = $state('');

const filtered = $derived(
	filter
		? data.authors.filter(
				(a) =>
					a.name.toLowerCase().includes(filter.toLowerCase()) ||
					a.aliases.some((al) => al.toLowerCase().includes(filter.toLowerCase())),
			)
		: data.authors,
);
</script>

<svelte:head>
	<title>Autoren – werk.review</title>
</svelte:head>

<div class="page-header">
	<h1>Autoren</h1>
	<p class="page-subtitle">{data.authors.length} Autoren in der Datenbank</p>
</div>

<div class="filter-bar">
	<label for="author-filter" class="sr-only">Autoren filtern</label>
	<input
		id="author-filter"
		type="search"
		placeholder="Autor suchen…"
		bind:value={filter}
	/>
	<span class="count">{filtered.length} {filtered.length === 1 ? 'Autor' : 'Autoren'}</span>
</div>

<div class="author-list">
	{#each filtered as author}
		<a href="/autoren/{author.slug}" class="author-row">
			<span class="author-initial">{author.name.charAt(0)}</span>
			<div class="author-main">
				<span class="author-name">{author.name}</span>
				{#if author.born || author.died}
					<span class="author-years">{author.born ?? '?'}–{author.died ?? '?'}</span>
				{/if}
			</div>
			<span class="work-count">{author.workCount} {author.workCount === 1 ? 'Werk' : 'Werke'}</span>
		</a>
	{:else}
		<p class="empty">Keine Autoren gefunden.</p>
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

	.filter-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.filter-bar input {
		flex: 1;
		font-family: var(--font-ui);
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.filter-bar input::placeholder {
		color: var(--color-text-muted);
	}

	.filter-bar input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.count {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.82rem;
		white-space: nowrap;
		letter-spacing: 0.02em;
	}

	.author-list {
		display: flex;
		flex-direction: column;
	}

	.author-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.author-row:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.author-initial {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-accent);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-light);
		flex-shrink: 0;
	}

	.author-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.author-years {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.work-count {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-gold);
		white-space: nowrap;
	}

	.empty {
		color: var(--color-text-muted);
		padding: 2rem 0;
		text-align: center;
		font-style: italic;
	}

	@media (max-width: 640px) {
		.author-row:hover {
			margin: 0;
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
