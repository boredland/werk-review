<script lang="ts">
import { enhance } from '$app/forms';

let { data, form } = $props();
</script>

<svelte:head>
	<title>Autorenfoto hochladen – werk.review</title>
</svelte:head>

<div class="admin-page">
	<h1>Autorenfoto hochladen</h1>

	{#if form?.error}
		<div class="banner banner--error" role="alert">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="banner banner--success" role="status">
			Foto für {form.authorName} hochgeladen. R2-Key: <code>{form.key}</code>
			<br />Trage <code>"{form.key}"</code> als <code>photo_r2_key</code> in die Autoren-JSON-Datei ein.
		</div>
	{/if}

	<form method="POST" enctype="multipart/form-data" use:enhance>
		<div class="field">
			<label for="author_id">Autor</label>
			<select id="author_id" name="author_id" required>
				<option value="">Autor wählen…</option>
				{#each data.authors as author}
					<option value={author.id}>{author.name}</option>
				{/each}
			</select>
		</div>

		<div class="field">
			<label for="photo">Foto (max. 2 MB, JPEG/PNG/WebP)</label>
			<input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
		</div>

		<button type="submit" class="btn-primary">Hochladen</button>
	</form>
</div>

<style>
	.admin-page {
		max-width: 520px;
	}

	.banner {
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.banner--error {
		background: rgba(158, 58, 58, 0.08);
		border: 1px solid rgba(158, 58, 58, 0.2);
		color: var(--color-waste);
	}

	.banner--success {
		background: rgba(61, 107, 79, 0.08);
		border: 1px solid rgba(61, 107, 79, 0.2);
		color: var(--color-recommendation);
	}

	.banner code {
		background: var(--color-surface-warm);
		padding: 0.1rem 0.35rem;
		font-size: 0.82rem;
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
	}

	.field select,
	.field input[type='file'] {
		width: 100%;
		font-family: var(--font-ui);
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.92rem;
		color: var(--color-text);
	}

	.field select:focus,
	.field input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.btn-primary {
		font-family: var(--font-ui);
		padding: 0.65rem 1.75rem;
		background: var(--color-accent);
		color: #fff;
		border: none;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}
</style>
