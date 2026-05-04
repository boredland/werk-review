import { eq } from 'drizzle-orm';
import { authorSuggestions, bookmarks, reads, reviews, users } from '$lib/db/schema';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (!platform?.env.DB) {
		return new Response('Service Unavailable', { status: 503 });
	}

	const db = getDb(platform.env.DB);
	const userId = locals.user.id;

	const [userData, userReviews, userBookmarks, userReads, userSuggestions] = await Promise.all([
		db.select().from(users).where(eq(users.id, userId)).get(),
		db.select().from(reviews).where(eq(reviews.userId, userId)),
		db.select().from(bookmarks).where(eq(bookmarks.userId, userId)),
		db.select().from(reads).where(eq(reads.userId, userId)),
		db.select().from(authorSuggestions).where(eq(authorSuggestions.userId, userId)),
	]);

	// Remove password hash and verify token from export
	const safeUserData = userData
		? {
				id: userData.id,
				username: userData.username,
				email: userData.email,
				emailVerified: userData.emailVerified,
				createdAt: userData.createdAt,
			}
		: null;

	const exportData = {
		user: safeUserData,
		reviews: userReviews,
		bookmarks: userBookmarks,
		reads: userReads,
		authorSuggestions: userSuggestions,
		exportedAt: new Date().toISOString(),
	};

	return new Response(JSON.stringify(exportData, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename="werk_review_data_${locals.user.username}.json"`,
		},
	});
};
