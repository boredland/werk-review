<script lang="ts">
import { getRatingConfig } from '$lib/ratings';

type Review = {
	id: string;
	rating: number;
	ratingLabel: string;
	title: string | null;
	body: string | null;
	version: string | null;
	createdAt: string;
	username: string;
};

let { reviews, score }: { reviews: Review[]; score: number } = $props();
</script>

{#if reviews.length > 0}
	<section class="reviews-section">
		<div class="reviews-header">
			<h2>Bewertungen <span class="reviews-count">({reviews.length})</span></h2>
			<span class="score" class:positive={score > 0} class:negative={score < 0}>
				{score > 0 ? '+' : ''}{score} Punkte
			</span>
		</div>

		<div class="reviews-list">
			{#each reviews as review}
				{@const config = getRatingConfig(review.rating)}
				<div class="review-card">
					<div class="review-header">
						<span class="review-badge" style="border-color: {config.color}; color: {config.color}">
							{config.emoji} {config.label}
						</span>
						<span class="review-meta">
							{review.username} · {new Date(review.createdAt).toLocaleDateString('de-DE')}
						</span>
					</div>
					{#if review.title}
						<h3 class="review-title">{review.title}</h3>
					{/if}
					{#if review.body}
						<p class="review-body">{review.body}</p>
					{/if}
					{#if review.version}
						<p class="review-version">{review.version}</p>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{:else}
	<section class="reviews-section">
		<h2>Bewertungen</h2>
		<p class="empty">Noch keine Bewertungen vorhanden.</p>
	</section>
{/if}

<style>
	.reviews-section {
		margin-top: 3rem;
	}

	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.6rem;
		margin-bottom: 1.25rem;
	}

	.reviews-header h2 {
		margin: 0;
	}

	.reviews-count {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.score {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.15rem;
	}

	.score.positive {
		color: var(--color-recommendation);
	}

	.score.negative {
		color: var(--color-waste);
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
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
		gap: 0.5rem;
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

	.review-meta {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
	}

	.review-title {
		font-size: 1rem;
		margin: 0.5rem 0 0.25rem;
	}

	.review-body {
		line-height: 1.65;
		margin: 0.35rem 0;
	}

	.review-version {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0.5rem 0 0;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
