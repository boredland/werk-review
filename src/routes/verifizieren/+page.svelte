<script lang="ts">
import { page } from '$app/state';

const isNew = $derived(page.url.searchParams.get('neu') === '1');
const verified = $derived(page.url.searchParams.get('ok') === '1');
const user = $derived(page.data.user);
</script>

<svelte:head>
	<title>E-Mail bestätigen – werk.review</title>
</svelte:head>

<div class="verify-page">
	<div class="verify-card">
		{#if verified}
			<div class="verify-icon">&#10003;</div>
			<h1>E-Mail bestätigt</h1>
			<p>Deine E-Mail-Adresse wurde erfolgreich verifiziert.</p>
			<a href="/" class="btn-primary">Zur Startseite</a>
		{:else if isNew}
			<div class="verify-icon">&#9993;</div>
			<h1>Bestätige deine E-Mail</h1>
			<p>
				Wir haben dir einen Bestätigungslink an <strong>{user?.email ?? 'deine E-Mail-Adresse'}</strong> geschickt.
				Bitte klicke auf den Link, um dein Konto zu aktivieren.
			</p>
			<p class="hint">
				Den Link findest du in deinem Postfach. Prüfe auch den Spam-Ordner.
			</p>
		{:else}
			<div class="verify-icon">&#9993;</div>
			<h1>E-Mail-Verifizierung</h1>
			<p>Bitte nutze den Link aus deiner Bestätigungsmail.</p>
		{/if}
	</div>
</div>

<style>
	.verify-page {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}

	.verify-card {
		width: 100%;
		max-width: 480px;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		padding: 2.5rem;
		text-align: center;
	}

	.verify-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		line-height: 1;
	}

	.verify-card h1 {
		margin-bottom: 1rem;
	}

	.verify-card p {
		font-family: var(--font-ui);
		font-size: 0.92rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-bottom: 0.75rem;
	}

	.hint {
		font-size: 0.82rem !important;
		opacity: 0.7;
	}

	.btn-primary {
		display: inline-block;
		margin-top: 1rem;
		font-family: var(--font-ui);
		padding: 0.7rem 2rem;
		background: var(--color-accent);
		color: #fff;
		border: none;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-decoration: none;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
		text-decoration: none;
	}
</style>
