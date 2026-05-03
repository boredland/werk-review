<script lang="ts">
	import { enhance } from '$app/forms';
	import { RATINGS } from '$lib/ratings';

	type UserReview = {
		id: string;
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		username: string;
	} | null;

	let { userReview, form }: { userReview: UserReview; form: Record<string, unknown> | null } =
		$props();

	let selectedRating = $state(userReview?.ratingLabel ?? '');
</script>

<section class="review-form-section">
	<h2>{userReview ? 'Deine Bewertung bearbeiten' : 'Bewertung abgeben'}</h2>

	{#if form?.reviewError}
		<div class="error-banner" role="alert">{form.reviewError}</div>
	{/if}

	{#if form?.reviewSuccess}
		<div class="success-banner" role="status">Bewertung gespeichert!</div>
	{/if}

	<form method="POST" action="?/review" use:enhance>
		<fieldset class="rating-fieldset">
			<legend>Bewertung</legend>
			<div class="rating-options">
				{#each RATINGS as r}
					<label class="rating-option" class:selected={selectedRating === r.label}>
						<input
							type="radio"
							name="rating_label"
							value={r.label}
							required
							bind:group={selectedRating}
						/>
						<span class="rating-emoji">{r.emoji}</span>
						<span class="rating-label">{r.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<div class="field">
			<label for="review-title">Titel (optional)</label>
			<input
				id="review-title"
				name="title"
				type="text"
				maxlength="200"
				value={userReview?.title ?? ''}
			/>
		</div>

		<div class="field">
			<label for="review-body">Rezension (optional)</label>
			<textarea id="review-body" name="body" rows="4" maxlength="5000"
				>{userReview?.body ?? ''}</textarea
			>
		</div>

		<div class="field">
			<label for="review-version">Version (optional)</label>
			<input
				id="review-version"
				name="version"
				type="text"
				placeholder="z.B. Hörbuch, E-Book, Print – Diogenes 2019"
				maxlength="200"
				value={userReview?.version ?? ''}
			/>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-primary">
				{userReview ? 'Aktualisieren' : 'Bewertung abgeben'}
			</button>
		</div>
	</form>

	{#if userReview}
		<form method="POST" action="?/deleteReview" use:enhance class="delete-form">
			<button type="submit" class="btn-danger">Bewertung löschen</button>
		</form>
	{/if}
</section>

<style>
	.review-form-section {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 2px solid var(--color-border);
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.success-banner {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #166534;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.rating-fieldset {
		border: none;
		padding: 0;
		margin: 0 0 1.25rem;
	}

	.rating-fieldset legend {
		font-weight: 600;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.rating-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.5rem;
	}

	.rating-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.rating-option:hover {
		border-color: var(--color-accent);
	}

	.rating-option.selected {
		border-color: var(--color-accent);
		background: #f0f7ff;
	}

	.rating-option input {
		display: none;
	}

	.rating-emoji {
		font-size: 1.2rem;
	}

	.rating-label {
		font-size: 0.9rem;
	}

	.field {
		margin-bottom: 1rem;
	}

	.field label {
		display: block;
		margin-bottom: 0.35rem;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.95rem;
		font-family: inherit;
	}

	.field input:focus,
	.field textarea:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.form-actions {
		margin-top: 1rem;
	}

	.btn-primary {
		padding: 0.6rem 1.5rem;
		background: var(--color-accent);
		color: #fff;
		border: none;
		border-radius: 4px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.delete-form {
		margin-top: 0.75rem;
	}

	.btn-danger {
		padding: 0.4rem 1rem;
		background: none;
		color: var(--color-waste);
		border: 1px solid var(--color-waste);
		border-radius: 4px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-danger:hover {
		background: #fef2f2;
	}
</style>
