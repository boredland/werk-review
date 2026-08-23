import { error, fail } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { bookmarks, reads, reviewReactions, reviews, users } from '$lib/db/schema';
import { getRatingByLabel } from '$lib/ratings';
import {
	getAuthor,
	getChildWorkIds,
	getCollectionType,
	getDescendantWorkIds,
	getFortsetzungNeighbors,
	getGenre,
	getLinksForWork,
	getSimilarWorks,
	getWork,
	getWorks,
	rollUpStats,
} from '$lib/server/data';
import {
	getAllWorkReviewStats,
	getDb,
	invalidateWorkReviewStats,
	type WorkReviewStats,
} from '$lib/server/db';
import { getPlot } from '$lib/server/plots';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const work = getWork(params.slug);
	if (!work) error(404, 'Werk nicht gefunden');

	const author = getAuthor(work.author_id);
	const genres = work.genre_ids
		.map((id) => getGenre(id))
		.filter((g): g is NonNullable<typeof g> => !!g)
		.map((g) => ({ name: g.name, slug: g.slug }));

	const allWorks = getWorks();
	const workMap = new Map(allWorks.map((w) => [w.id, w]));

	// Per-user state (bookmarks, reads, own review, reactions) is deliberately
	// absent: it is fetched client-side from /api/work-state so this HTML is the
	// same for every visitor and can be cached at the edge.

	// One aggregate fetch feeds the similar list, the child list and the score
	// roll-up below.
	const allStats = platform?.env.DB
		? await getAllWorkReviewStats(platform.env.DB, platform.env.SESSION_KV).catch(
				() => new Map<string, WorkReviewStats>(),
			)
		: new Map<string, WorkReviewStats>();

	const similar = getSimilarWorks(work.id).map((w) => {
		const s = rollUpStats(w.id, allStats);
		return {
			slug: w.slug,
			title: w.title,
			year_display: w.year_display,
			reviewCount: s.reviewCount,
			avgRating: s.avgRating,
			totalPoints: s.totalPoints,
		};
	});

	let workReviews: {
		id: string;
		userId: string;
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		username: string;
		reactionCount: number;
	}[] = [];
	let score = 0;

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const rows = await db
				.select({
					id: reviews.id,
					rating: reviews.rating,
					ratingLabel: reviews.ratingLabel,
					title: reviews.title,
					body: reviews.body,
					version: reviews.version,
					createdAt: reviews.createdAt,
					username: users.username,
					userId: reviews.userId,
				})
				.from(reviews)
				.innerJoin(users, eq(reviews.userId, users.id))
				.where(eq(reviews.workId, work.id))
				.orderBy(desc(reviews.createdAt));

			const reviewIds = rows.map((r) => r.id);
			const reactionsList =
				reviewIds.length > 0
					? await db
							.select({ reviewId: reviewReactions.reviewId })
							.from(reviewReactions)
							.where(inArray(reviewReactions.reviewId, reviewIds))
					: [];

			// Totals only. Which reviews the visitor reacted to is resolved in the
			// browser so this payload stays user-independent.
			const reactionCounts = new Map<string, number>();
			for (const reaction of reactionsList) {
				reactionCounts.set(reaction.reviewId, (reactionCounts.get(reaction.reviewId) ?? 0) + 1);
			}

			workReviews = rows.map((r) => ({
				id: r.id,
				userId: r.userId,
				rating: r.rating,
				ratingLabel: r.ratingLabel,
				title: r.title,
				body: r.body,
				version: r.version,
				createdAt: r.createdAt,
				username: r.username,
				reactionCount: reactionCounts.get(r.id) ?? 0,
			}));

			score = rows.reduce((sum, r) => sum + r.rating, 0);

			for (const id of getDescendantWorkIds(work.id)) {
				score += allStats.get(id)?.totalPoints ?? 0;
			}
		} catch {
			// D1 tables may not exist yet in local dev
		}
	}

	// LibriVox data is fetched by the player component on mount. Prefetching it
	// here meant one self-subrequest through this same Worker per audiobook,
	// each fanning out to librivox.org, which was timing out whole pages.
	const externalLinks = getLinksForWork(work);

	const parentWorks = work.parent_slugs
		.map((slug) => workMap.get(slug))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => ({ title: w.title, slug: w.slug, type: getCollectionType(w) }));

	const childWorks = getChildWorkIds(work.id)
		.map((id) => getWork(id))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => {
			const s = rollUpStats(w.id, allStats);
			return {
				title: w.title,
				slug: w.slug,
				year_display: w.year_display,
				reviewCount: s.reviewCount,
				avgRating: s.avgRating,
				totalPoints: s.totalPoints,
			};
		});

	const collectionType = getCollectionType(work);
	const childrenType = childWorks.length > 0 ? getChildrenType(work.id) : null;
	const neighbors = getFortsetzungNeighbors(work.id);
	const fortsetzungVon = neighbors.predecessors
		.map((id) => workMap.get(id))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => ({ title: w.title, slug: w.slug }));
	const fortgesetztDurch = neighbors.successors
		.map((id) => workMap.get(id))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => ({ title: w.title, slug: w.slug }));

	return {
		work: { ...work, plot: getPlot(work.id) },
		author: author ? { name: author.name, slug: author.slug } : null,
		genres,
		parentWorks,
		childWorks,
		collectionType,
		childrenType,
		fortsetzungVon,
		fortgesetztDurch,
		similar,
		reviews: workReviews,
		score,
		externalLinks,
	};
};

function getChildrenType(parentId: string): 'zyklus' | 'band' {
	const children = getWorks().filter((w) => w.parent_slugs?.includes(parentId));
	const anyHasChain = children.some((c) => {
		const n = getFortsetzungNeighbors(c.id);
		return n.predecessors.length > 0 || n.successors.length > 0;
	});
	return anyHasChain ? 'zyklus' : 'band';
}

export const actions: Actions = {
	review: async ({ request, platform, locals, params }) => {
		if (!locals.user) {
			return fail(401, { reviewError: 'Du musst eingeloggt sein, um eine Bewertung abzugeben.' });
		}

		if (!platform?.env.DB) {
			return fail(500, { reviewError: 'Datenbank nicht verfügbar.' });
		}

		const work = getWork(params.slug);
		if (!work) error(404, 'Werk nicht gefunden');

		const data = await request.formData();
		const ratingLabel = data.get('rating_label') as string;
		const title = (data.get('title') as string)?.trim() || null;
		const body = (data.get('body') as string)?.trim() || null;
		const version = (data.get('version') as string)?.trim() || null;

		const ratingConfig = getRatingByLabel(ratingLabel);
		if (!ratingConfig) {
			return fail(400, { reviewError: 'Ungültige Bewertung.' });
		}

		const db = getDb(platform.env.DB);

		const existing = await db
			.select({ id: reviews.id })
			.from(reviews)
			.where(and(eq(reviews.userId, locals.user.id), eq(reviews.workId, work.id)))
			.get();

		if (existing) {
			await db
				.update(reviews)
				.set({
					rating: ratingConfig.value,
					ratingLabel: ratingConfig.label,
					title,
					body,
					version,
				})
				.where(eq(reviews.id, existing.id));
		} else {
			await db.insert(reviews).values({
				id: crypto.randomUUID(),
				userId: locals.user.id,
				workId: work.id,
				rating: ratingConfig.value,
				ratingLabel: ratingConfig.label,
				title,
				body,
				version,
			});
		}

		await invalidateWorkReviewStats(platform?.env.SESSION_KV);

		return { reviewSuccess: true };
	},

	toggleBookmark: async ({ platform, locals, params }) => {
		if (!locals.user || !platform?.env.DB) {
			return fail(401, { error: 'Nicht autorisiert.' });
		}

		const work = getWork(params.slug);
		if (!work) error(404, 'Werk nicht gefunden');

		const db = getDb(platform.env.DB);
		const existing = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.userId, locals.user.id), eq(bookmarks.workId, work.id)))
			.get();

		if (existing) {
			await db
				.delete(bookmarks)
				.where(and(eq(bookmarks.userId, locals.user.id), eq(bookmarks.workId, work.id)));
		} else {
			await db.insert(bookmarks).values({
				userId: locals.user.id,
				workId: work.id,
			});
		}

		return { bookmarkToggled: true };
	},

	toggleRead: async ({ platform, locals, params }) => {
		if (!locals.user || !platform?.env.DB) {
			return fail(401, { error: 'Nicht autorisiert.' });
		}

		const work = getWork(params.slug);
		if (!work) error(404, 'Werk nicht gefunden');

		const db = getDb(platform.env.DB);
		const existing = await db
			.select()
			.from(reads)
			.where(and(eq(reads.userId, locals.user.id), eq(reads.workId, work.id)))
			.get();

		if (existing) {
			await db
				.delete(reads)
				.where(and(eq(reads.userId, locals.user.id), eq(reads.workId, work.id)));
		} else {
			await db.insert(reads).values({
				userId: locals.user.id,
				workId: work.id,
			});
		}

		return { readToggled: true };
	},

	deleteReview: async ({ platform, locals, params }) => {
		if (!locals.user || !platform?.env.DB) {
			return fail(401, { reviewError: 'Nicht autorisiert.' });
		}

		const work = getWork(params.slug);
		if (!work) error(404, 'Werk nicht gefunden');

		const db = getDb(platform.env.DB);
		await db
			.delete(reviews)
			.where(and(eq(reviews.userId, locals.user.id), eq(reviews.workId, work.id)));

		await invalidateWorkReviewStats(platform?.env.SESSION_KV);

		return { reviewDeleted: true };
	},

	toggleReaction: async ({ request, platform, locals }) => {
		if (!locals.user || !platform?.env.DB) {
			return fail(401, { error: 'Nicht autorisiert.' });
		}

		const data = await request.formData();
		const reviewId = data.get('reviewId') as string;
		if (!reviewId) return fail(400, { error: 'Review-ID fehlt.' });

		const db = getDb(platform.env.DB);
		const existing = await db
			.select()
			.from(reviewReactions)
			.where(
				and(eq(reviewReactions.userId, locals.user.id), eq(reviewReactions.reviewId, reviewId)),
			)
			.get();

		if (existing) {
			await db
				.delete(reviewReactions)
				.where(
					and(eq(reviewReactions.userId, locals.user.id), eq(reviewReactions.reviewId, reviewId)),
				);
		} else {
			await db.insert(reviewReactions).values({
				userId: locals.user.id,
				reviewId,
			});
		}

		return { reactionToggled: true };
	},
};
