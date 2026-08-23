import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { bookmarks, reads, reviewReactions, reviews } from '$lib/db/schema';
import { getWork } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

const EMPTY = {
	isBookmarked: false,
	isRead: false,
	readWorkIds: [],
	reactedReviewIds: [],
	myReviewId: null,
};

/**
 * Per-user state for a work page. Kept out of the rendered HTML so the page is
 * identical for every visitor and can be cached at the edge; the page fetches
 * this on mount and fills in the user-specific controls.
 */
export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const noStore = { headers: { 'cache-control': 'private, no-store' } };
	const work = getWork(params.slug);
	if (!locals.user || !work || !platform?.env.DB) return json(EMPTY, noStore);

	try {
		const db = getDb(platform.env.DB);
		const userId = locals.user.id;

		const [readsList, bookmark, reactions, myReview] = await Promise.all([
			db.select({ workId: reads.workId }).from(reads).where(eq(reads.userId, userId)),
			db
				.select({ workId: bookmarks.workId })
				.from(bookmarks)
				.where(and(eq(bookmarks.userId, userId), eq(bookmarks.workId, work.id)))
				.get(),
			db
				.select({ reviewId: reviewReactions.reviewId })
				.from(reviewReactions)
				.where(eq(reviewReactions.userId, userId)),
			db
				.select({ id: reviews.id })
				.from(reviews)
				.where(and(eq(reviews.userId, userId), eq(reviews.workId, work.id)))
				.get(),
		]);

		const readWorkIds = readsList.map((r) => r.workId);
		return json(
			{
				isBookmarked: !!bookmark,
				isRead: readWorkIds.includes(work.id),
				readWorkIds,
				reactedReviewIds: reactions.map((r) => r.reviewId),
				myReviewId: myReview?.id ?? null,
			},
			noStore,
		);
	} catch {
		return json(EMPTY, noStore);
	}
};
