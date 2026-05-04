<script lang="ts">
interface Crumb {
	label: string;
	href?: string;
}

interface Props {
	items: Crumb[];
}

let { items }: Props = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol>
		{#each items as item, i}
			<li>
				{#if item.href && i < items.length - 1}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span aria-current="page">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		margin-bottom: 1.5rem;
	}

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0;
		font-family: var(--font-ui);
		font-size: 0.82rem;
	}

	li:not(:last-child)::after {
		content: '›';
		margin: 0 0.5rem;
		color: var(--color-border);
	}

	a {
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}

	a:hover {
		color: var(--color-accent);
		text-decoration: none;
	}

	span {
		color: var(--color-text);
		font-weight: 500;
	}
</style>
