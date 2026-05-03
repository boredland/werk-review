import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { authorSuggestions, users } from '$lib/db/schema';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { suggestions: [] };

	const db = getDb(platform.env.DB);
	const rows = await db
		.select({
			id: authorSuggestions.id,
			suggestedName: authorSuggestions.suggestedName,
			note: authorSuggestions.note,
			status: authorSuggestions.status,
			createdAt: authorSuggestions.createdAt,
			username: users.username,
		})
		.from(authorSuggestions)
		.leftJoin(users, eq(authorSuggestions.userId, users.id))
		.orderBy(desc(authorSuggestions.createdAt));

	return { suggestions: rows };
};

export const actions: Actions = {
	accept: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500);
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400);

		const db = getDb(platform.env.DB);
		await db
			.update(authorSuggestions)
			.set({ status: 'accepted' })
			.where(eq(authorSuggestions.id, id));
	},
	reject: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500);
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400);

		const db = getDb(platform.env.DB);
		await db
			.update(authorSuggestions)
			.set({ status: 'rejected' })
			.where(eq(authorSuggestions.id, id));
	},
};
