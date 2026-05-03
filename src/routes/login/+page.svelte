<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Login – Datenbank klassischer Literatur</title>
</svelte:head>

<div class="auth-page">
	<h1>Login</h1>

	{#if form?.error}
		<div class="error-banner" role="alert">{form.error}</div>
	{/if}

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

		<div class="field">
			<label for="password">Passwort</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="current-password"
			/>
		</div>

		<button type="submit" class="btn-primary">Einloggen</button>
	</form>

	<p class="alt-link">
		Noch kein Konto? <a href="/registrieren">Jetzt registrieren</a>
	</p>
</div>

<style>
	.auth-page {
		max-width: 400px;
		margin: 0 auto;
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.field {
		margin-bottom: 1.25rem;
	}

	.field label {
		display: block;
		margin-bottom: 0.35rem;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.field input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.95rem;
	}

	.field input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.btn-primary {
		width: 100%;
		padding: 0.6rem;
		background: var(--color-accent);
		color: #fff;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.alt-link {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}
</style>
