<script lang="ts">
import { enhance } from '$app/forms';
import { getRatingConfig } from '$lib/ratings';

let { data } = $props();
</script>

<svelte:head>
	<title>Bewertungen – Admin – werk.review</title>
</svelte:head>

<h1>Bewertungen moderieren</h1>

<p class="review-count">{data.reviews.length} neueste Bewertungen</p>

<div class="reviews-list">
	{#each data.reviews as review}
		{@const config = getRatingConfig(review.rating)}
		<div class="review-card">
			<div class="review-header">
				<div class="review-meta">
					<a href="/werke/{review.workSlug}" class="review-work">{review.workTitle}</a>
					<span class="review-user">von {review.username}</span>
				</div>
				<span class="review-badge" style="border-color: {config.color}; color: {config.color}">
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
				<span class="review-date">{new Date(review.createdAt).toLocaleDateString('de-DE')}</span>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="reviewId" value={review.id} />
					<button type="submit" class="delete-btn">Löschen</button>
				</form>
			</div>
		</div>
	{/each}
</div>

<style>
	.review-count {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
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
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.review-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.review-work {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.05rem;
	}

	.review-user {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
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
		flex-shrink: 0;
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
	}

	.delete-btn {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--color-waste);
		background: transparent;
		color: var(--color-waste);
		cursor: pointer;
		transition: all 0.15s;
	}

	.delete-btn:hover {
		background: var(--color-waste);
		color: #fff;
	}
</style>
