<script lang="ts">
import { enhance } from '$app/forms';

let { data, form } = $props();
</script>

<svelte:head>
	<title>Autor vorschlagen – werk.review</title>
</svelte:head>

<h1>Autor vorschlagen</h1>
<p class="page-intro">Schlage einen Autor vor, der noch in unserer Datenbank fehlt. Wir prüfen den Vorschlag und fügen ihn gegebenenfalls hinzu.</p>

<div class="suggest-form-wrap">
	{#if form?.success}
		<div class="success-banner" role="status">Vielen Dank! Dein Vorschlag wurde eingereicht.</div>
	{/if}

	{#if form?.error}
		<div class="error-banner" role="alert">{form.error}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="field">
			<label for="name">Autorenname</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				minlength="2"
				value={form?.error ? form?.name ?? '' : ''}
				placeholder="z.B. Annette von Droste-Hülshoff"
			/>
		</div>

		<div class="field">
			<label for="note">Anmerkung <span class="optional">(optional)</span></label>
			<textarea
				id="note"
				name="note"
				rows="3"
				placeholder="Warum sollte dieser Autor aufgenommen werden?"
			>{form?.error ? form?.note ?? '' : ''}</textarea>
		</div>

		<button type="submit" class="btn-primary">Vorschlag einreichen</button>
	</form>
</div>

{#if data.suggestions.length > 0}
	<section class="my-suggestions">
		<h2>Meine Vorschläge</h2>
		<div class="suggestions-list">
			{#each data.suggestions as s}
				<div class="suggestion-row">
					<div class="suggestion-info">
						<span class="suggestion-name">{s.suggestedName}</span>
						{#if s.note}
							<span class="suggestion-note">{s.note}</span>
						{/if}
					</div>
					<span class="suggestion-status" class:status--pending={s.status === 'pending'} class:status--accepted={s.status === 'accepted'} class:status--rejected={s.status === 'rejected'}>
						{#if s.status === 'pending'}Ausstehend{:else if s.status === 'accepted'}Angenommen{:else}Abgelehnt{/if}
					</span>
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.page-intro {
		font-family: var(--font-ui);
		font-size: 0.92rem;
		color: var(--color-text-muted);
		max-width: 600px;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.suggest-form-wrap {
		max-width: 520px;
		margin-bottom: 3rem;
	}

	.success-banner {
		background: rgba(45, 106, 79, 0.08);
		border: 1px solid rgba(45, 106, 79, 0.2);
		color: #2d6a4f;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
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

	.optional {
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.field input,
	.field textarea {
		width: 100%;
		font-family: var(--font-ui);
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		font-size: 0.92rem;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
		resize: vertical;
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.btn-primary {
		font-family: var(--font-ui);
		padding: 0.7rem 2rem;
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

	.my-suggestions {
		border-top: 1px solid var(--color-border);
		padding-top: 2rem;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
	}

	.suggestion-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	.suggestion-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.suggestion-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.suggestion-note {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
	}

	.suggestion-status {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.2rem 0.6rem;
		white-space: nowrap;
	}

	.status--pending {
		color: var(--color-gold);
		background: var(--color-gold-light);
		border: 1px solid rgba(184, 150, 62, 0.3);
	}

	.status--accepted {
		color: #2d6a4f;
		background: rgba(45, 106, 79, 0.1);
		border: 1px solid rgba(45, 106, 79, 0.2);
	}

	.status--rejected {
		color: var(--color-waste);
		background: rgba(158, 58, 58, 0.08);
		border: 1px solid rgba(158, 58, 58, 0.2);
	}
</style>
