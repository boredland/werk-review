<script lang="ts">
	import { page } from '$app/state';
	import { getRatingConfig } from '$lib/ratings';

	let { data } = $props();

	const user = $derived(page.data.user);
</script>

<svelte:head>
	<title>Mein Konto – Datenbank klassischer Literatur</title>
</svelte:head>

<h1>Mein Konto</h1>

{#if user}
	<section class="profile">
		<dl class="profile-info">
			<dt>Benutzername</dt>
			<dd>{user.username}</dd>
			<dt>E-Mail</dt>
			<dd>{user.email}</dd>
		</dl>
	</section>

	<section class="reviews-section">
		<h2>Meine Bewertungen ({data.userReviews.length})</h2>

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
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
	}

	.profile-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem 1.5rem;
		margin: 0;
	}

	.profile-info dt {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.profile-info dd {
		margin: 0;
	}

	.reviews-section {
		margin-top: 1.5rem;
	}

	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.review-card {
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.review-work {
		font-weight: 600;
	}

	.review-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.6rem;
		border: 1.5px solid;
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.review-title {
		font-size: 0.95rem;
		margin: 0.5rem 0 0.25rem;
	}

	.review-body {
		line-height: 1.6;
		margin: 0.25rem 0;
		font-size: 0.9rem;
	}

	.review-date {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin: 0.5rem 0 0;
	}

	.empty {
		color: var(--color-text-muted);
	}
</style>
