<script lang="ts">
import { enhance } from '$app/forms';
import { page } from '$app/state';
import { getRatingConfig } from '$lib/ratings';

let { data, form } = $props();

const user = $derived(page.data.user);
</script>

<svelte:head>
	<title>Mein Konto – werk.review</title>
</svelte:head>

<h1>Mein Konto</h1>

{#if user}
	{#if form?.resent}
		<div class="banner banner--success" role="status">Bestätigungsmail wurde erneut gesendet.</div>
	{/if}
	{#if form?.error}
		<div class="banner banner--error" role="alert">{form.error}</div>
	{/if}

	<section class="profile">
		<dl class="profile-info">
			<dt>Benutzername</dt>
			<dd>{user.username}</dd>
			<dt>E-Mail</dt>
			<dd>
				{user.email}
				{#if user.emailVerified}
					<span class="badge badge--ok">Bestätigt</span>
				{:else}
					<span class="badge badge--warn">Nicht bestätigt</span>
					<form method="POST" action="?/resendVerification" use:enhance class="resend-form">
						<button type="submit" class="resend-btn">Erneut senden</button>
					</form>
				{/if}
			</dd>
		</dl>
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
						<p class="review-date">
							{new Date(review.createdAt).toLocaleDateString('de-DE')}
						</p>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty">Du hast noch keine Bewertungen abgegeben.</p>
		{/if}
	</section>
{/if}

<style>
	.profile {
		margin-bottom: 2.5rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
	}

	.profile-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 2rem;
		margin: 0;
	}

	.profile-info dt {
		font-family: var(--font-ui);
		font-weight: 500;
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.profile-info dd {
		margin: 0;
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	.review-date {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0.5rem 0 0;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
