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
			<h2>Bewertungen ({reviews.length})</h2>
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
							{review.username} &middot; {new Date(review.createdAt).toLocaleDateString('de-DE')}
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
		margin-top: 2.5rem;
	}

	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	.reviews-header h2 {
		margin: 0;
	}

	.score {
		font-weight: 700;
		font-size: 1.1rem;
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
		gap: 1rem;
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
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
		gap: 0.5rem;
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

	.review-meta {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.review-title {
		font-size: 1rem;
		margin: 0.5rem 0 0.25rem;
	}

	.review-body {
		line-height: 1.6;
		margin: 0.25rem 0;
	}

	.review-version {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0.5rem 0 0;
	}

	.empty {
		color: var(--color-text-muted);
	}
</style>
