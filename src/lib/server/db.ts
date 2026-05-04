import { avg, count, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/db/schema';
import { reviews } from '$lib/db/schema';

export function getDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type WorkReviewStats = { reviewCount: number; avgRating: number | null };

const STATS_CACHE_TTL = 300;

export async function getWorkReviewStats(
	d1: D1Database,
	workIds: string[],
	kv?: KVNamespace,
): Promise<Map<string, WorkReviewStats>> {
	const result = new Map<string, WorkReviewStats>();
	if (workIds.length === 0) return result;

	const cacheKey = `review-stats:${workIds.sort().join(',')}`;

	if (kv) {
		const cached = await kv.get(cacheKey);
		if (cached) {
			const entries: [string, WorkReviewStats][] = JSON.parse(cached);
			return new Map(entries);
		}
	}

	const db = getDb(d1);
	const rows = await db
		.select({
			workId: reviews.workId,
			reviewCount: count(reviews.id),
			avgRating: avg(reviews.rating),
		})
		.from(reviews)
		.where(inArray(reviews.workId, workIds))
		.groupBy(reviews.workId);

	for (const row of rows) {
		result.set(row.workId, {
			reviewCount: row.reviewCount,
			avgRating: row.avgRating !== null ? Number(row.avgRating) : null,
		});
	}

	if (kv) {
		kv.put(cacheKey, JSON.stringify([...result.entries()]), { expirationTtl: STATS_CACHE_TTL });
	}

	return result;
}
