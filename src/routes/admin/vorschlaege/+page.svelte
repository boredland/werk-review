<script lang="ts">
import { enhance } from '$app/forms';

let { data } = $props();
</script>

<svelte:head>
	<title>Vorschläge verwalten – werk.review</title>
</svelte:head>

<h1>Autorenvorschläge</h1>

{#if data.suggestions.length === 0}
	<p class="empty">Keine Vorschläge vorhanden.</p>
{:else}
	<div class="suggestions-list">
		{#each data.suggestions as s}
			<div class="suggestion-card" class:card--pending={s.status === 'pending'} class:card--accepted={s.status === 'accepted'} class:card--rejected={s.status === 'rejected'}>
				<div class="suggestion-header">
					<span class="suggestion-name">{s.suggestedName}</span>
					<span class="suggestion-status" class:status--pending={s.status === 'pending'} class:status--accepted={s.status === 'accepted'} class:status--rejected={s.status === 'rejected'}>
						{#if s.status === 'pending'}Ausstehend{:else if s.status === 'accepted'}Angenommen{:else}Abgelehnt{/if}
					</span>
				</div>

				{#if s.note}
					<p class="suggestion-note">{s.note}</p>
				{/if}

				<div class="suggestion-meta">
					<span>von {s.username ?? 'Unbekannt'}</span>
					<span>{new Date(s.createdAt).toLocaleDateString('de-DE')}</span>
				</div>

				{#if s.status === 'pending'}
					<div class="suggestion-actions">
						<form method="POST" action="?/accept" use:enhance>
							<input type="hidden" name="id" value={s.id} />
							<button type="submit" class="btn btn--accept">Annehmen</button>
						</form>
						<form method="POST" action="?/reject" use:enhance>
							<input type="hidden" name="id" value={s.id} />
							<button type="submit" class="btn btn--reject">Ablehnen</button>
						</form>
					</div>
				{:else if s.status === 'accepted'}
					<div class="add-hint">
						<span class="add-hint-text">In Google Sheet eintragen:</span>
						<code class="add-hint-name">{s.suggestedName}</code>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.suggestion-card {
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
	}

	.card--pending {
		border-left: 3px solid var(--color-gold);
	}

	.card--accepted {
		border-left: 3px solid #2d6a4f;
		opacity: 0.7;
	}

	.card--rejected {
		border-left: 3px solid var(--color-waste);
		opacity: 0.5;
	}

	.suggestion-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.suggestion-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.1rem;
	}

	.suggestion-status {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.2rem 0.6rem;
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

	.suggestion-note {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0.75rem 0 0;
		line-height: 1.5;
	}

	.suggestion-meta {
		display: flex;
		gap: 1rem;
		margin-top: 0.75rem;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
	}

	.suggestion-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn {
		font-family: var(--font-ui);
		padding: 0.4rem 1rem;
		font-size: 0.82rem;
		font-weight: 600;
		border: 1px solid;
		cursor: pointer;
		transition: all 0.2s;
		background: transparent;
	}

	.btn--accept {
		color: #2d6a4f;
		border-color: #2d6a4f;
	}

	.btn--accept:hover {
		background: rgba(45, 106, 79, 0.1);
	}

	.btn--reject {
		color: var(--color-waste);
		border-color: var(--color-waste);
	}

	.btn--reject:hover {
		background: rgba(158, 58, 58, 0.08);
	}

	.add-hint {
		margin-top: 0.75rem;
		padding: 0.6rem 0.85rem;
		background: rgba(45, 106, 79, 0.06);
		border: 1px solid rgba(45, 106, 79, 0.15);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.add-hint-text {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
	}

	.add-hint-name {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--color-text);
		background: var(--color-surface-warm);
		padding: 0.1rem 0.4rem;
	}
</style>
