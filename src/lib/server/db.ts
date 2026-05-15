import { and, avg, count, gt, inArray, sum } from 'drizzle-orm';
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

const STATS_CACHE_TTL = 300;

export async function getWorkReviewStats(
	d1: D1Database,
	workIds: string[],
	kv?: KVNamespace,
): Promise<Map<string, WorkReviewStats>> {
	const result = new Map<string, WorkReviewStats>();
	if (workIds.length === 0) return result;

	const uncachedWorkIds: string[] = [];

	if (kv) {
		const cachedValues = await Promise.all(workIds.map((id) => kv.get(`review-stats:${id}`)));
		for (let i = 0; i < workIds.length; i++) {
			const cached = cachedValues[i];
			if (cached) {
				result.set(workIds[i], JSON.parse(cached));
			} else {
				uncachedWorkIds.push(workIds[i]);
			}
		}
	} else {
		uncachedWorkIds.push(...workIds);
	}

	if (uncachedWorkIds.length > 0) {
		const db = getDb(d1);
		const fetchedStats = new Map<string, WorkReviewStats>();
		for (const id of uncachedWorkIds) {
			fetchedStats.set(id, { reviewCount: 0, avgRating: null, totalPoints: 0 });
		}

		// D1 has a bound-parameter limit; chunk to stay safely under it
		const CHUNK_SIZE = 50;
		for (let i = 0; i < uncachedWorkIds.length; i += CHUNK_SIZE) {
			const chunk = uncachedWorkIds.slice(i, i + CHUNK_SIZE);
			const rows = await db
				.select({
					workId: reviews.workId,
					reviewCount: count(reviews.id),
					avgRating: avg(reviews.rating),
					totalPoints: sum(reviews.rating),
				})
				.from(reviews)
				.where(inArray(reviews.workId, chunk))
				.groupBy(reviews.workId);

			for (const row of rows) {
				fetchedStats.set(row.workId, {
					reviewCount: row.reviewCount,
					avgRating: row.avgRating !== null ? Number(row.avgRating) : null,
					totalPoints: row.totalPoints !== null ? Number(row.totalPoints) : 0,
				});
			}
		}

		for (const [id, stats] of fetchedStats.entries()) {
			result.set(id, stats);
		}

		if (kv) {
			Promise.all(
				Array.from(fetchedStats.entries()).map(([id, stats]) =>
					kv.put(`review-stats:${id}`, JSON.stringify(stats), { expirationTtl: STATS_CACHE_TTL }),
				),
			).catch(() => {});
		}
	}

	return result;
}

export type AuthorReviewStats = { totalPoints: number; recommendations: number };

export async function getAuthorReviewStats(
	d1: D1Database,
	workIdsByAuthor: Map<string, string[]>,
	_kv?: KVNamespace,
): Promise<Map<string, AuthorReviewStats>> {
	const result = new Map<string, AuthorReviewStats>();
	const allWorkIds = Array.from(workIdsByAuthor.values()).flat();
	if (allWorkIds.length === 0) return result;

	const db = getDb(d1);

	// Query stats for all works
	const rows = await db
		.select({
			workId: reviews.workId,
			totalPoints: sum(reviews.rating),
			// Count only ratings > 0 as recommendations
		})
		.from(reviews)
		.where(inArray(reviews.workId, allWorkIds))
		.groupBy(reviews.workId);

	// Also get recommendations count. SQLite doesn't have a simple COUNT(IF) in drizzle easily, so we query it separately or map it.
	const recRows = await db
		.select({
			workId: reviews.workId,
			recommendations: count(reviews.id),
		})
		.from(reviews)
		.where(and(inArray(reviews.workId, allWorkIds), gt(reviews.rating, 0)))
		.groupBy(reviews.workId);

	const workStats = new Map<string, { totalPoints: number; recommendations: number }>();
	for (const row of rows) {
		workStats.set(row.workId, {
			totalPoints: row.totalPoints ? Number(row.totalPoints) : 0,
			recommendations: 0,
		});
	}
	for (const row of recRows) {
		const stat = workStats.get(row.workId);
		if (stat) stat.recommendations = row.recommendations;
	}

	// Aggregate by author
	for (const [authorId, workIds] of workIdsByAuthor.entries()) {
		let totalPoints = 0;
		let recommendations = 0;
		for (const wId of workIds) {
			const stat = workStats.get(wId);
			if (stat) {
				totalPoints += stat.totalPoints;
				recommendations += stat.recommendations;
			}
		}
		result.set(authorId, { totalPoints, recommendations });
	}

	return result;
}
