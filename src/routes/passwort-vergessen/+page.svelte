<script lang="ts">
import { enhance } from '$app/forms';

let { form } = $props();
</script>

<svelte:head>
	<title>Passwort vergessen – werk.review</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<h1>Passwort vergessen</h1>

		{#if form?.sent}
			<div class="success-banner" role="status">
				Falls ein Konto mit dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt. Prüfe auch den Spam-Ordner.
			</div>
		{/if}

		{#if form?.error}
			<div class="error-banner" role="alert">{form.error}</div>
		{/if}

		{#if !form?.sent}
			<p class="intro">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen deines Passworts.</p>

			<form method="POST" use:enhance>
				<div class="field">
					<label for="email">E-Mail</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={form?.email ?? ''}
						autocomplete="email"
					/>
				</div>

				<button type="submit" class="btn-primary">Link senden</button>
			</form>
		{/if}

		<p class="alt-link">
			<a href="/login">Zurück zum Login</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		padding: 1rem 0;
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		padding: 2.5rem;
	}

	.auth-card h1 {
		text-align: center;
		margin-bottom: 1.75rem;
	}

	.intro {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.success-banner {
		background: rgba(45, 106, 79, 0.08);
		border: 1px solid rgba(45, 106, 79, 0.2);
		color: #2d6a4f;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.error-banner {
		background: rgba(158, 58, 58, 0.08);
		border: 1px solid rgba(158, 58, 58, 0.2);
		color: var(--color-waste);
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
	}

	.field {
		margin-bottom: 1.25rem;
	}

	.field label {
		display: block;
		margin-bottom: 0.4rem;
		font-family: var(--font-ui);
		font-weight: 500;
		font-size: 0.85rem;
		letter-spacing: 0.02em;
		color: var(--color-text);
	}

	.field input {
		width: 100%;
		font-family: var(--font-ui);
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		font-size: 0.92rem;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.field input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.btn-primary {
		width: 100%;
		font-family: var(--font-ui);
		padding: 0.7rem;
		background: var(--color-accent);
		color: #fff;
		border: none;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.alt-link {
		text-align: center;
		margin-top: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}
</style>
