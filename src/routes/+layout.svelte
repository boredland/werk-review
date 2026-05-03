<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content="Datenbank klassischer Literatur – Autoren, Werke und Bewertungen" />
</svelte:head>

<Header />

<main>
	{@render children()}
</main>

<footer class="footer">
	<div class="footer-inner">
		<p>&copy; {new Date().getFullYear()} Datenbank klassischer Literatur</p>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--color-border);
		padding: 1.5rem 1rem;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.footer-inner {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.footer p {
		margin: 0;
	}
</style>
