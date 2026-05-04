import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { authorSuggestions, bookmarks, reviews, users } from '$lib/db/schema';
import { isAdmin } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { users: [] };

	const db = getDb(platform.env.DB);
	const rows = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			emailVerified: users.emailVerified,
			banned: users.banned,
			createdAt: users.createdAt,
		})
		.from(users)
		.orderBy(desc(users.createdAt));

	return { users: rows };
};

export const actions: Actions = {
	ban: async ({ request, platform, locals }) => {
		if (!locals.user || !isAdmin(locals.user)) return fail(403);
		if (!platform?.env.DB || !platform?.env.SESSION_KV) return fail(500);

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		if (!userId || userId === locals.user.id) return fail(400);

		const db = getDb(platform.env.DB);
		await db.update(users).set({ banned: true }).where(eq(users.id, userId));
		await platform.env.SESSION_KV.put(`banned:${userId}`, '1', { expirationTtl: 86400 * 365 });

		return { success: true };
	},

	unban: async ({ request, platform, locals }) => {
		if (!locals.user || !isAdmin(locals.user)) return fail(403);
		if (!platform?.env.DB || !platform?.env.SESSION_KV) return fail(500);

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		if (!userId) return fail(400);

		const db = getDb(platform.env.DB);
		await db.update(users).set({ banned: false }).where(eq(users.id, userId));
		await platform.env.SESSION_KV.delete(`banned:${userId}`);

		return { success: true };
	},

	deleteUser: async ({ request, platform, locals }) => {
		if (!locals.user || !isAdmin(locals.user)) return fail(403);
		if (!platform?.env.DB || !platform?.env.SESSION_KV) return fail(500);

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		if (!userId || userId === locals.user.id) return fail(400);

		const db = getDb(platform.env.DB);
		await db.delete(reviews).where(eq(reviews.userId, userId));
		await db.delete(bookmarks).where(eq(bookmarks.userId, userId));
		await db.delete(authorSuggestions).where(eq(authorSuggestions.userId, userId));
		await db.delete(users).where(eq(users.id, userId));
		await platform.env.SESSION_KV.put(`banned:${userId}`, '1', { expirationTtl: 86400 });

		return { deleted: true };
	},
};
