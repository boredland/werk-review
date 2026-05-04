import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { reviews, users } from '$lib/db/schema';
import { isAdmin } from '$lib/server/auth';
import { getWork } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { reviews: [] };

	const db = getDb(platform.env.DB);
	const rows = await db
		.select({
			id: reviews.id,
			workId: reviews.workId,
			rating: reviews.rating,
			ratingLabel: reviews.ratingLabel,
			title: reviews.title,
			body: reviews.body,
			createdAt: reviews.createdAt,
			username: users.username,
		})
		.from(reviews)
		.innerJoin(users, eq(reviews.userId, users.id))
		.orderBy(desc(reviews.createdAt))
		.limit(100);

	const allReviews = rows
		.map((r) => {
			const work = getWork(r.workId);
			if (!work) return null;
			return {
				id: r.id,
				workTitle: work.title,
				workSlug: work.slug,
				rating: r.rating,
				ratingLabel: r.ratingLabel,
				title: r.title,
				body: r.body,
				createdAt: r.createdAt,
				username: r.username,
			};
		})
		.filter((r): r is NonNullable<typeof r> => r !== null);

	return { reviews: allReviews };
};

export const actions: Actions = {
	delete: async ({ request, platform, locals }) => {
		if (!locals.user || !isAdmin(locals.user)) return fail(403);
		if (!platform?.env.DB) return fail(500);

		const formData = await request.formData();
		const reviewId = formData.get('reviewId') as string;
		if (!reviewId) return fail(400);

		const db = getDb(platform.env.DB);
		await db.delete(reviews).where(eq(reviews.id, reviewId));

		return { deleted: true };
	},
};
