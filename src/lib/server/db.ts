import { avg, count, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/db/schema';
import { reviews } from '$lib/db/schema';

export function getDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type WorkReviewStats = {
	reviewCount: number;
	avgRating: number | null;
	totalPoints: number;
};

// Reviews are few and read on nearly every page, so the whole table is
// aggregated in one query and cached under a single key. The previous shape
// issued one KV read per work id, which meant over a thousand reads to serve
// the work listing.
const STATS_CACHE_TTL = 300;
const STATS_CACHE_KEY = 'review-stats:all:v2';

/**
 * Review totals for every work that has at least one review. Works without
 * reviews are absent; callers treat a miss as zero.
 */
export async function getAllWorkReviewStats(
	d1: D1Database,
	kv?: KVNamespace,
): Promise<Map<string, WorkReviewStats>> {
	if (kv) {
		const cached = await kv.get(STATS_CACHE_KEY, 'json');
		if (cached) return new Map(cached as [string, WorkReviewStats][]);
	}

	const rows = await getDb(d1)
		.select({
			workId: reviews.workId,
			reviewCount: count(reviews.id),
			avgRating: avg(reviews.rating),
			totalPoints: sum(reviews.rating),
		})
		.from(reviews)
		.groupBy(reviews.workId);

	const stats = new Map<string, WorkReviewStats>();
	for (const row of rows) {
		stats.set(row.workId, {
			reviewCount: row.reviewCount,
			avgRating: row.avgRating !== null ? Number(row.avgRating) : null,
			totalPoints: row.totalPoints !== null ? Number(row.totalPoints) : 0,
		});
	}

	if (kv) {
		kv.put(STATS_CACHE_KEY, JSON.stringify(Array.from(stats)), {
			expirationTtl: STATS_CACHE_TTL,
		}).catch(() => {});
	}

	return stats;
}

/** Drops the cached totals so the next render reflects a new or deleted review. */
export async function invalidateWorkReviewStats(kv?: KVNamespace): Promise<void> {
	if (kv) await kv.delete(STATS_CACHE_KEY);
}
