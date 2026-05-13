import { error, fail } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { bookmarks, reads, reviewReactions, reviews, users } from '$lib/db/schema';
import { getRatingByLabel } from '$lib/ratings';
import {
	getAuthor,
	getCollectionType,
	getDescendantWorkIds,
	getFortsetzungNeighbors,
	getGenre,
	getLinksForWork,
	getSimilarWorks,
	getWork,
	getWorks,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getDb, getWorkReviewStats } from '$lib/server/db';
import type { LibriVoxData } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, locals, fetch }) => {
	const work = getWork(params.slug);
	if (!work) error(404, 'Werk nicht gefunden');

	const author = getAuthor(work.author_id);
	const genres = work.genre_ids
		.map((id) => getGenre(id))
		.filter((g): g is NonNullable<typeof g> => !!g)
		.map((g) => ({ name: g.name, slug: g.slug }));

	const allWorks = getWorks();
	const workMap = new Map(allWorks.map((w) => [w.id, w]));

	let isBookmarked = false;
	let isRead = false;
	const userReadWorkIds = new Set<string>();

	if (locals.user && platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);

			const [readsList, bm] = await Promise.all([
				db.select({ workId: reads.workId }).from(reads).where(eq(reads.userId, locals.user.id)),
				db
					.select()
					.from(bookmarks)
					.where(and(eq(bookmarks.userId, locals.user.id), eq(bookmarks.workId, work.id)))
					.get(),
			]);

			for (const r of readsList) {
				userReadWorkIds.add(r.workId);
			}
			isRead = userReadWorkIds.has(work.id);
			isBookmarked = !!bm;
		} catch {}
	}

	const similarRaw = getSimilarWorks(work.id)
		.map((s) => workMap.get(s.work_id))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.filter((w) => !userReadWorkIds.has(w.id));
	const similarStats = platform?.env.DB
		? await getWorkReviewStats(
				platform.env.DB,
				withDescendantIds(similarRaw.map((w) => w.id)),
				platform.env.SESSION_KV,
			).catch(() => new Map())
		: new Map();
	const similar = similarRaw.map((w) => {
		const s = rollUpStats(w.id, similarStats);
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
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		username: string;
		reactionCount: number;
		hasUserReacted: boolean;
	}[] = [];
	let userReview: (typeof workReviews)[number] | null = null;
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

			// Fetch all reactions for these reviews in one go
			const reviewIds = rows.map((r) => r.id);
			const reactionsList =
				reviewIds.length > 0
					? await db
							.select()
							.from(reviewReactions)
							.where(inArray(reviewReactions.reviewId, reviewIds))
					: [];

			const reactionsByReview = new Map<string, { count: number; hasUserReacted: boolean }>();
			for (const rId of reviewIds) {
				reactionsByReview.set(rId, { count: 0, hasUserReacted: false });
			}

			for (const reaction of reactionsList) {
				const entry = reactionsByReview.get(reaction.reviewId);
				if (entry) {
					entry.count++;
					if (locals.user && reaction.userId === locals.user.id) {
						entry.hasUserReacted = true;
					}
				}
			}

			workReviews = rows.map((r) => {
				const reactionData = reactionsByReview.get(r.id);
				return {
					id: r.id,
					rating: r.rating,
					ratingLabel: r.ratingLabel,
					title: r.title,
					body: r.body,
					version: r.version,
					createdAt: r.createdAt,
					username: r.username,
					reactionCount: reactionData?.count ?? 0,
					hasUserReacted: reactionData?.hasUserReacted ?? false,
				};
			});

			if (locals.user) {
				const mine = rows.find((r) => r.userId === locals.user?.id);
				if (mine) {
					const reactionData = reactionsByReview.get(mine.id);
					userReview = {
						id: mine.id,
						rating: mine.rating,
						ratingLabel: mine.ratingLabel,
						title: mine.title,
						body: mine.body,
						version: mine.version,
						createdAt: mine.createdAt,
						username: mine.username,
						reactionCount: reactionData?.count ?? 0,
						hasUserReacted: reactionData?.hasUserReacted ?? false,
					};
				}
			}

			score = rows.reduce((sum, r) => sum + r.rating, 0);

			const descendants = getDescendantWorkIds(work.id);
			if (descendants.length > 0) {
				const descStats = await getWorkReviewStats(
					platform.env.DB,
					descendants,
					platform.env.SESSION_KV,
				);
				for (const s of descStats.values()) {
					score += s.totalPoints;
				}
			}
		} catch {
			// D1 tables may not exist yet in local dev
		}
	}

	const externalLinks = getLinksForWork(work);
	const librivoxData: Record<string, LibriVoxData> = {};

	await Promise.all(
		externalLinks
			.filter((l) => l.librivox_id)
			.map(async (l) => {
				try {
					const id = l.librivox_id;
					if (id) {
						const res = await fetch(`/api/librivox/${id}`);
						if (res.ok) {
							librivoxData[id] = await res.json();
						}
					}
				} catch (e) {
					console.error(`Error pre-fetching LibriVox ${l.librivox_id}:`, e);
				}
			}),
	);

	const parentWorks = work.parent_slugs
		.map((slug) => workMap.get(slug))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => ({ title: w.title, slug: w.slug, type: getCollectionType(w) }));

	const childWorkRaw = allWorks.filter((w) => w.parent_slugs?.includes(work.slug));
	const childStats = platform?.env.DB
		? await getWorkReviewStats(
				platform.env.DB,
				withDescendantIds(childWorkRaw.map((w) => w.id)),
				platform.env.SESSION_KV,
			).catch(() => new Map())
		: new Map();
	const childWorks = childWorkRaw.map((w) => {
		const s = rollUpStats(w.id, childStats);
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
		work,
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
		userReview,
		score,
		isBookmarked,
		isRead,
		externalLinks,
		librivoxData,
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

		if (platform?.env.SESSION_KV) {
			await platform.env.SESSION_KV.delete(`review-stats:${work.id}`);
		}

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

		if (platform?.env.SESSION_KV) {
			await platform.env.SESSION_KV.delete(`review-stats:${work.id}`);
		}

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
