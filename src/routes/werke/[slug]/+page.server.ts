import { error, fail } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { getWork, getAuthor, getGenre, getSimilarWorks, getWorks } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import { reviews, users } from '$lib/db/schema';
import { getRatingByLabel, RATINGS } from '$lib/ratings';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const work = getWork(params.slug);
	if (!work) error(404, 'Werk nicht gefunden');

	const author = getAuthor(work.author_id);
	const genre = getGenre(work.genre_id);

	const allWorks = getWorks();
	const workMap = new Map(allWorks.map((w) => [w.id, w]));

	const similar = getSimilarWorks(work.id)
		.map((s) => workMap.get(s.work_id))
		.filter((w): w is NonNullable<typeof w> => !!w)
		.map((w) => ({
			slug: w.slug,
			title: w.title,
			year_display: w.year_display
		}));

	let workReviews: {
		id: string;
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		username: string;
	}[] = [];
	let userReview: typeof workReviews[number] | null = null;
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
					userId: reviews.userId
				})
				.from(reviews)
				.innerJoin(users, eq(reviews.userId, users.id))
				.where(eq(reviews.workId, work.id))
				.orderBy(desc(reviews.createdAt));

			workReviews = rows.map((r) => ({
				id: r.id,
				rating: r.rating,
				ratingLabel: r.ratingLabel,
				title: r.title,
				body: r.body,
				version: r.version,
				createdAt: r.createdAt,
				username: r.username
			}));

			if (locals.user) {
				const mine = rows.find((r) => r.userId === locals.user!.id);
				if (mine) {
					userReview = {
						id: mine.id,
						rating: mine.rating,
						ratingLabel: mine.ratingLabel,
						title: mine.title,
						body: mine.body,
						version: mine.version,
						createdAt: mine.createdAt,
						username: mine.username
					};
				}
			}

			score = rows.reduce((sum, r) => sum + r.rating, 0);
		} catch {
			// D1 tables may not exist yet in local dev
		}
	}

	return {
		work,
		author: author ? { name: author.name, slug: author.slug } : null,
		genre: genre ? { name: genre.name, slug: genre.slug } : null,
		similar,
		reviews: workReviews,
		userReview,
		score
	};
};

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
					version
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
				version
			});
		}

		return { reviewSuccess: true };
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

		return { reviewDeleted: true };
	}
};
