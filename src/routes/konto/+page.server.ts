import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { reviews } from '$lib/db/schema';
import { getWork } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(302, '/login');

	let userReviews: {
		id: string;
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		workTitle: string;
		workSlug: string;
	}[] = [];

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const rows = await db
				.select()
				.from(reviews)
				.where(eq(reviews.userId, locals.user.id))
				.orderBy(desc(reviews.createdAt));

			userReviews = rows
				.map((r) => {
					const work = getWork(r.workId);
					if (!work) return null;
					return {
						id: r.id,
						rating: r.rating,
						ratingLabel: r.ratingLabel,
						title: r.title,
						body: r.body,
						version: r.version,
						createdAt: r.createdAt,
						workTitle: work.title,
						workSlug: work.slug,
					};
				})
				.filter((r): r is NonNullable<typeof r> => r !== null);
		} catch {
			// D1 tables may not exist yet in local dev
		}
	}

	return { userReviews };
};
