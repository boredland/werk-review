<script lang="ts">
import { enhance } from '$app/forms';
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
	reactionCount: number;
	hasUserReacted: boolean;
};

let {
	reviews,
	score,
	user,
}: { reviews: Review[]; score: number; user: { id: string; username: string } | null } = $props();
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
					
					<div class="review-footer">
						<form
							method="POST"
							action="?/toggleReaction"
							use:enhance={() => {
								if (!user) return;
								// Optimistic update
								if (review.hasUserReacted) {
									review.reactionCount--;
									review.hasUserReacted = false;
								} else {
									review.reactionCount++;
									review.hasUserReacted = true;
								}
								return async ({ update }) => {
									await update({ reset: false });
								};
							}}
						>
							<input type="hidden" name="reviewId" value={review.id} />
							<button
								type="submit"
								class="reaction-btn"
								class:active={review.hasUserReacted}
								disabled={!user}
								title={user ? (review.hasUserReacted ? 'Reaktion entfernen' : 'Reagieren') : 'Anmelden zum Reagieren'}
							>
								<svg width="16" height="16" viewBox="0 0 20 20" fill={review.hasUserReacted ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
									<path d="M10 18l-1.45-1.32C3.4 12.11 0 9.03 0 5.25 0 2.19 2.42 0 5.5 0 7.24 0 8.91.81 10 2.09 11.09.81 12.76 0 14.5 0 17.58 0 20 2.19 20 5.25c0 3.78-3.4 6.86-8.55 11.43L10 18z" />
								</svg>
								<span class="reaction-label">Hilfreich</span>
								{#if review.reactionCount > 0}
									<span class="reaction-count">{review.reactionCount}</span>
								{/if}
							</button>
						</form>
					</div>
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

	.review-footer {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
	}

	.reaction-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.6rem;
		background: none;
		border: 1px solid var(--color-border-light);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		border-radius: 4px;
	}

	.reaction-btn:not(:disabled):hover {
		background: var(--color-surface-warm);
		border-color: var(--color-gold);
		color: var(--color-gold);
	}

	.reaction-btn.active {
		border-color: var(--color-gold);
		color: var(--color-gold);
		background: var(--color-gold-light);
	}

	.reaction-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.reaction-count {
		font-weight: 700;
		color: var(--color-gold);
		margin-left: 0.2rem;
	}

	.reaction-label {
		font-weight: 500;
	}
</style>
