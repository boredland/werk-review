<script lang="ts">
import { getRatingConfig } from '$lib/ratings';

interface Props {
	avgRating: number | null;
	reviewCount: number;
}

let { avgRating, reviewCount }: Props = $props();

const ratingConfig = $derived(avgRating !== null ? getRatingConfig(Math.round(avgRating)) : null);
</script>

{#if reviewCount > 0 && ratingConfig}
	<span class="rating-badge" title="{ratingConfig.label} ({reviewCount} {reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})">
		<span class="rating-emoji">{ratingConfig.emoji}</span>
		<span class="rating-count">{reviewCount}</span>
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

	.rating-count {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
