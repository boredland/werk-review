<script lang="ts">
import { getRatingConfig } from '$lib/ratings';

interface Props {
	avgRating: number | null;
	totalPoints?: number | null;
	reviewCount: number;
}

let { avgRating, totalPoints, reviewCount }: Props = $props();

const ratingConfig = $derived(avgRating !== null ? getRatingConfig(Math.round(avgRating)) : null);
</script>

{#if reviewCount > 0 && ratingConfig}
	<span class="rating-badge" title="{ratingConfig.label} ({reviewCount} {reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})">
		<span class="rating-emoji">{ratingConfig.emoji}</span>
		{#if totalPoints !== undefined && totalPoints !== null}
			<span class="rating-points" class:positive={totalPoints > 0} class:negative={totalPoints < 0}>
				{totalPoints > 0 ? '+' : ''}{totalPoints} {totalPoints === 1 || totalPoints === -1 ? 'Punkt' : 'Punkte'}
			</span>
		{/if}
	</span>
{/if}

<style>
	.rating-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-ui);
		white-space: nowrap;
	}

	.rating-emoji {
		font-size: 0.85rem;
		line-height: 1;
	}

	.rating-points {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
		margin-left: 0.2rem;
	}

	.rating-points.positive {
		color: var(--color-gold);
	}

	.rating-points.negative {
		color: var(--color-waste);
	}
</style>
