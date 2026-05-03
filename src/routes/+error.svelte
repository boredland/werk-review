<script lang="ts">
import { page } from '$app/state';
</script>

<svelte:head>
	<title>Fehler {page.status} – werk.review</title>
</svelte:head>

<div class="error-page">
	<span class="error-code">{page.status}</span>
	<h1>
		{#if page.status === 404}
			Seite nicht gefunden
		{:else if page.status === 401}
			Nicht berechtigt
		{:else if page.status === 503}
			Vorübergehend nicht verfügbar
		{:else}
			Ein Fehler ist aufgetreten
		{/if}
	</h1>
	<p class="error-message">
		{#if page.error?.message}
			{page.error.message}
		{:else if page.status === 404}
			Die angeforderte Seite existiert nicht oder wurde verschoben.
		{:else}
			Bitte versuche es später erneut.
		{/if}
	</p>
	<div class="error-actions">
		<a href="/" class="error-link">Zur Startseite</a>
		<a href="/autoren" class="error-link error-link--secondary">Autoren durchstöbern</a>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 4rem 1rem;
	}

	.error-code {
		font-family: var(--font-display);
		font-size: 6rem;
		font-weight: 600;
		line-height: 1;
		color: var(--color-border);
		letter-spacing: -0.03em;
	}

	.error-page h1 {
		margin-top: 0.5rem;
		margin-bottom: 0.75rem;
		font-size: 1.8rem;
	}

	.error-message {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.95rem;
		max-width: 420px;
		margin-bottom: 2rem;
	}

	.error-actions {
		display: flex;
		gap: 0.75rem;
	}

	.error-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		padding: 0.6rem 1.25rem;
		background: var(--color-accent);
		color: #fff;
		text-decoration: none;
		transition: background 0.2s;
	}

	.error-link:hover {
		background: var(--color-accent-hover);
		text-decoration: none;
		color: #fff;
	}

	.error-link--secondary {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.error-link--secondary:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: transparent;
	}
</style>
