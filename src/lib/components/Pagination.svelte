<script lang="ts">
interface Props {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

let { currentPage, totalPages, onPageChange }: Props = $props();

const pages = $derived(() => {
	const result: (number | '...')[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
			result.push(i);
		} else if (result[result.length - 1] !== '...') {
			result.push('...');
		}
	}
	return result;
});
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Seitennavigation">
		<button
			class="page-btn"
			disabled={currentPage <= 1}
			onclick={() => onPageChange(currentPage - 1)}
			aria-label="Vorherige Seite"
		>
			‹
		</button>

		{#each pages() as p}
			{#if p === '...'}
				<span class="page-ellipsis">…</span>
			{:else}
				<button
					class="page-btn"
					class:active={p === currentPage}
					onclick={() => onPageChange(p)}
					aria-label="Seite {p}"
					aria-current={p === currentPage ? 'page' : undefined}
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			class="page-btn"
			disabled={currentPage >= totalPages}
			onclick={() => onPageChange(currentPage + 1)}
			aria-label="Nächste Seite"
		>
			›
		</button>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border-light);
	}

	.page-btn {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		min-width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.4rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s;
	}

	.page-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.page-btn.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
		font-weight: 600;
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.page-ellipsis {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		padding: 0 0.2rem;
	}
</style>
