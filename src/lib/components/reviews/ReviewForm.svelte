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

const bodyPlaceholder = `Empfiehlt anderen Lesern die Werke bitte so persönlich wie möglich.
•	Wie fandet ihr den Schreibstil?
•	Wie fandet ihr die Figuren in der Geschichte?
•	Fandet ihr die Handlung spannend?
•	Gab es für euch interessante philosophische Gedanken?
•	Habt ihr durch das Werk etwas gelernt?`;
</script>

<section class="review-form-section">
	<h2>{userReview ? 'Deine Bewertung bearbeiten' : 'Bewertung abgeben'}</h2>

	{#if form?.reviewError}
		<div class="banner banner--error" role="alert">{form.reviewError}</div>
	{/if}

	{#if form?.reviewSuccess}
		<div class="banner banner--success" role="status">Bewertung gespeichert!</div>
	{/if}

	<form method="POST" action="?/review" use:enhance>
		<fieldset class="rating-fieldset">
			<legend>Bewertung</legend>
			<div class="rating-options">
				{#each RATINGS as r}
					<label class="rating-option" class:selected={selectedRating === r.label} style="--rating-color: {r.color}">
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
				placeholder={bodyPlaceholder}
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
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.banner {
		padding: 0.75rem 1rem;
		margin-bottom: 1.25rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
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

	.rating-fieldset {
		border: none;
		padding: 0;
		margin: 0 0 1.5rem;
	}

	.rating-fieldset legend {
		font-family: var(--font-ui);
		font-weight: 500;
		font-size: 0.85rem;
		letter-spacing: 0.02em;
		margin-bottom: 0.6rem;
		color: var(--color-text);
	}

	.rating-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
		gap: 0.5rem;
	}

	.rating-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.85rem;
		border: 1.5px solid var(--color-border-light);
		background: var(--color-surface);
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
	}

	.rating-option:hover {
		border-color: var(--rating-color, var(--color-accent));
	}

	.rating-option.selected {
		border-color: var(--rating-color, var(--color-accent));
		background: var(--color-surface-warm);
	}

	.rating-option input {
		display: none;
	}

	.rating-emoji {
		font-size: 1.2rem;
	}

	.rating-label {
		font-family: var(--font-ui);
		font-size: 0.88rem;
		font-weight: 500;
	}

	.field {
		margin-bottom: 1.1rem;
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

	.field input,
	.field textarea {
		width: 100%;
		font-family: var(--font-ui);
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.92rem;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.field textarea {
		font-family: var(--font-body);
		line-height: 1.6;
		resize: vertical;
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.form-actions {
		margin-top: 1.25rem;
	}

	.btn-primary {
		font-family: var(--font-ui);
		padding: 0.65rem 1.75rem;
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

	.delete-form {
		margin-top: 0.75rem;
	}

	.btn-danger {
		font-family: var(--font-ui);
		padding: 0.45rem 1rem;
		background: none;
		color: var(--color-waste);
		border: 1px solid var(--color-waste);
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-danger:hover {
		background: rgba(158, 58, 58, 0.06);
	}
</style>
