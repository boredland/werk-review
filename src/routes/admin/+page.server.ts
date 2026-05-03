import { count, eq } from 'drizzle-orm';
import { authorSuggestions, reviews, users } from '$lib/db/schema';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { userCount: 0, reviewCount: 0, suggestionCount: 0, pendingSuggestions: 0 };
	}

	const db = getDb(platform.env.DB);

	const [userRow, reviewRow, suggestionRow, pendingRow] = await Promise.all([
		db.select({ n: count() }).from(users).get(),
		db.select({ n: count() }).from(reviews).get(),
		db.select({ n: count() }).from(authorSuggestions).get(),
		db
			.select({ n: count() })
			.from(authorSuggestions)
			.where(eq(authorSuggestions.status, 'pending'))
			.get(),
	]);

	return {
		userCount: userRow?.n ?? 0,
		reviewCount: reviewRow?.n ?? 0,
		suggestionCount: suggestionRow?.n ?? 0,
		pendingSuggestions: pendingRow?.n ?? 0,
	};
};
