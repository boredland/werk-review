<script lang="ts">
import { enhance } from '$app/forms';
import { page } from '$app/state';
import EmptyState from '$lib/components/EmptyState.svelte';
import { getRatingConfig } from '$lib/ratings';

let { data, form } = $props();

const user = $derived(page.data.user);

let editingUsername = $state(false);
let editingEmail = $state(false);
let editingPassword = $state(false);
let showDeleteConfirm = $state(false);

$effect(() => {
	if (form?.usernameUpdated) editingUsername = false;
	if (form?.emailUpdated) editingEmail = false;
	if (form?.passwordUpdated) editingPassword = false;
});
</script>

<svelte:head>
	<title>Mein Konto – werk.review</title>
</svelte:head>

<h1>Mein Konto</h1>

{#if user}
	{#if form?.resent}
		<div class="banner banner--success" role="status">Bestätigungsmail wurde erneut gesendet.</div>
	{/if}
	{#if form?.reviewDeleted}
		<div class="banner banner--success" role="status">Bewertung wurde gelöscht.</div>
	{/if}
	{#if form?.usernameUpdated}
		<div class="banner banner--success" role="status">Benutzername wurde geändert.</div>
	{/if}
	{#if form?.emailUpdated}
		<div class="banner banner--success" role="status">E-Mail wurde geändert. Bitte bestätige deine neue Adresse.</div>
	{/if}
	{#if form?.passwordUpdated}
		<div class="banner banner--success" role="status">Passwort wurde geändert.</div>
	{/if}
	{#if form?.error}
		<div class="banner banner--error" role="alert">{form.error}</div>
	{/if}

	<section class="profile">
		<div class="profile-row">
			<div class="profile-label">Benutzername</div>
			{#if editingUsername}
				<form method="POST" action="?/updateUsername" use:enhance class="inline-form">
					<input type="text" name="username" value={user.username} required minlength="3" maxlength="30" class="form-input" />
					<div class="form-actions">
						<button type="submit" class="btn btn--primary">Speichern</button>
						<button type="button" class="btn btn--ghost" onclick={() => editingUsername = false}>Abbrechen</button>
					</div>
				</form>
			{:else}
				<div class="profile-value">
					<span>{user.username}</span>
					<button class="edit-btn" onclick={() => editingUsername = true}>Ändern</button>
				</div>
			{/if}
		</div>

		<div class="profile-row">
			<div class="profile-label">E-Mail</div>
			{#if editingEmail}
				<form method="POST" action="?/updateEmail" use:enhance class="inline-form">
					<input type="email" name="email" value={user.email} required class="form-input" />
					<div class="form-actions">
						<button type="submit" class="btn btn--primary">Speichern</button>
						<button type="button" class="btn btn--ghost" onclick={() => editingEmail = false}>Abbrechen</button>
					</div>
				</form>
			{:else}
				<div class="profile-value">
					<span>{user.email}</span>
					{#if user.emailVerified}
						<span class="badge badge--ok">Bestätigt</span>
					{:else}
						<span class="badge badge--warn">Nicht bestätigt</span>
						<form method="POST" action="?/resendVerification" use:enhance class="resend-form">
							<button type="submit" class="resend-btn">Erneut senden</button>
						</form>
					{/if}
					<button class="edit-btn" onclick={() => editingEmail = true}>Ändern</button>
				</div>
			{/if}
		</div>

		<div class="profile-row">
			<div class="profile-label">Passwort</div>
			{#if editingPassword}
				<form method="POST" action="?/updatePassword" use:enhance class="inline-form">
					<input type="password" name="currentPassword" placeholder="Aktuelles Passwort" required class="form-input" />
					<input type="password" name="newPassword" placeholder="Neues Passwort" required minlength="8" class="form-input" />
					<input type="password" name="confirmPassword" placeholder="Neues Passwort bestätigen" required class="form-input" />
					<div class="form-actions">
						<button type="submit" class="btn btn--primary">Speichern</button>
						<button type="button" class="btn btn--ghost" onclick={() => editingPassword = false}>Abbrechen</button>
					</div>
				</form>
			{:else}
				<div class="profile-value">
					<span>••••••••</span>
					<button class="edit-btn" onclick={() => editingPassword = true}>Ändern</button>
				</div>
			{/if}
		</div>
	</section>

	<section class="reviews-section">
		<h2>Meine Bewertungen <span class="reviews-count">({data.userReviews.length})</span></h2>

		{#if data.userReviews.length > 0}
			<div class="reviews-list">
				{#each data.userReviews as review}
					{@const config = getRatingConfig(review.rating)}
					<div class="review-card">
						<div class="review-header">
							<a href="/werke/{review.workSlug}" class="review-work">{review.workTitle}</a>
							<span
								class="review-badge"
								style="border-color: {config.color}; color: {config.color}"
							>
								{config.emoji} {config.label}
							</span>
						</div>
						{#if review.title}
							<h3 class="review-title">{review.title}</h3>
						{/if}
						{#if review.body}
							<p class="review-body">{review.body}</p>
						{/if}
						<div class="review-footer">
							<p class="review-date">
								{new Date(review.createdAt).toLocaleDateString('de-DE')}
							</p>
							<div class="review-actions">
								<a href="/werke/{review.workSlug}" class="review-action-link">Bearbeiten</a>
								<form method="POST" action="?/deleteReview" use:enhance class="inline-delete">
									<input type="hidden" name="reviewId" value={review.id} />
									<button type="submit" class="review-action-delete">Löschen</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<EmptyState icon="✍️" message="Du hast noch keine Bewertungen abgegeben." />
		{/if}
	</section>

	<section class="bookmarks-section">
		<h2>Leseliste <span class="reviews-count">({data.userBookmarks.length})</span></h2>

		{#if data.userBookmarks.length > 0}
			<div class="bookmarks-list">
				{#each data.userBookmarks as bookmark}
					<a href="/werke/{bookmark.workSlug}" class="bookmark-item">
						<span class="bookmark-title">{bookmark.workTitle}</span>
						<span class="bookmark-date">{new Date(bookmark.createdAt).toLocaleDateString('de-DE')}</span>
					</a>
				{/each}
			</div>
		{:else}
			<EmptyState icon="🔖" message="Du hast noch keine Werke auf deiner Leseliste." />
		{/if}
	</section>

	<section class="danger-zone">
		<h2>Konto löschen</h2>
		{#if form?.deleteError}
			<div class="banner banner--error" role="alert">{form.deleteError}</div>
		{/if}
		{#if showDeleteConfirm}
			<p class="danger-text">Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Bewertungen werden gelöscht.</p>
			<form method="POST" action="?/deleteAccount" use:enhance class="delete-form">
				<label class="delete-label">
					Passwort
					<input type="password" name="password" required class="form-input" />
				</label>
				<label class="delete-label">
					Gib <strong>{user.username}</strong> zur Bestätigung ein
					<input type="text" name="confirmation" required class="form-input" autocomplete="off" />
				</label>
				<div class="form-actions">
					<button type="submit" class="btn btn--danger">Konto endgültig löschen</button>
					<button type="button" class="btn btn--ghost" onclick={() => showDeleteConfirm = false}>Abbrechen</button>
				</div>
			</form>
		{:else}
			<p class="danger-text">Wenn du dein Konto löschst, werden alle deine Daten und Bewertungen unwiderruflich gelöscht.</p>
			<button class="btn btn--danger-outline" onclick={() => showDeleteConfirm = true}>Konto löschen …</button>
		{/if}
	</section>
{/if}

<style>
	.profile {
		margin-bottom: 2.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
	}

	.profile-row {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.profile-row:last-child {
		border-bottom: none;
	}

	.profile-label {
		font-family: var(--font-ui);
		font-weight: 500;
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 0.4rem;
	}

	.profile-value {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		font-size: 0.95rem;
	}

	.edit-btn {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		padding: 0.15rem 0.5rem;
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s;
		margin-left: auto;
	}

	.edit-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.inline-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.form-input {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text);
		max-width: 360px;
		transition: border-color 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.45rem 1rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}

	.btn--primary {
		background: var(--color-accent);
		color: #fff;
		border-color: var(--color-accent);
	}

	.btn--primary:hover {
		opacity: 0.9;
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text-muted);
		border-color: var(--color-border);
	}

	.btn--ghost:hover {
		color: var(--color-text);
		border-color: var(--color-text-muted);
	}

	.badge {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
	}

	.badge--ok {
		color: #2d6a4f;
		background: rgba(45, 106, 79, 0.1);
		border: 1px solid rgba(45, 106, 79, 0.2);
	}

	.badge--warn {
		color: var(--color-gold);
		background: var(--color-gold-light);
		border: 1px solid rgba(184, 150, 62, 0.3);
	}

	.banner {
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
	}

	.banner--success {
		background: rgba(45, 106, 79, 0.08);
		border: 1px solid rgba(45, 106, 79, 0.2);
		color: #2d6a4f;
	}

	.banner--error {
		background: rgba(158, 58, 58, 0.08);
		border: 1px solid rgba(158, 58, 58, 0.2);
		color: var(--color-waste);
	}

	.resend-form {
		display: inline;
	}

	.resend-btn {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		padding: 0.15rem 0.5rem;
		background: transparent;
		border: 1px solid var(--color-accent);
		color: var(--color-accent);
		cursor: pointer;
		transition: all 0.2s;
	}

	.resend-btn:hover {
		background: var(--color-accent);
		color: #fff;
	}

	.reviews-section {
		margin-top: 1rem;
	}

	.reviews-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.review-card {
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		transition: border-color 0.2s;
	}

	.review-card:hover {
		border-color: var(--color-border);
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.review-work {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.review-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.65rem;
		border: 1.5px solid;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.review-title {
		font-size: 0.95rem;
		margin: 0.6rem 0 0.25rem;
	}

	.review-body {
		line-height: 1.65;
		margin: 0.35rem 0;
		font-size: 0.9rem;
	}

	.review-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	.review-date {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.review-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.review-action-link {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-accent);
		text-decoration: none;
	}

	.review-action-link:hover {
		text-decoration: underline;
	}

	.inline-delete {
		display: inline;
	}

	.review-action-delete {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color 0.15s;
	}

	.review-action-delete:hover {
		color: var(--color-waste);
	}

	.bookmarks-section {
		margin-top: 2.5rem;
	}

	.bookmarks-list {
		display: flex;
		flex-direction: column;
	}

	.bookmark-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.bookmark-item:hover {
		text-decoration: none;
		background: var(--color-surface-warm);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.bookmark-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.bookmark-date {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
	}

	.danger-zone {
		margin-top: 3rem;
		padding: 1.5rem;
		border: 1px solid rgba(158, 58, 58, 0.25);
		background: rgba(158, 58, 58, 0.03);
	}

	.danger-zone h2 {
		color: var(--color-waste);
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
	}

	.danger-text {
		font-family: var(--font-ui);
		font-size: 0.88rem;
		color: var(--color-text-muted);
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.delete-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.delete-label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
	}

	.btn--danger {
		background: var(--color-waste);
		color: #fff;
		border-color: var(--color-waste);
	}

	.btn--danger:hover {
		opacity: 0.9;
	}

	.btn--danger-outline {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.45rem 1rem;
		cursor: pointer;
		background: transparent;
		color: var(--color-waste);
		border: 1px solid rgba(158, 58, 58, 0.4);
		transition: all 0.2s;
	}

	.btn--danger-outline:hover {
		background: var(--color-waste);
		color: #fff;
	}
</style>
