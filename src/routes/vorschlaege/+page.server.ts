import { fail, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { authorSuggestions } from '$lib/db/schema';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(302, '/login');

	let suggestions: {
		id: string;
		suggestedName: string;
		note: string | null;
		status: string;
		createdAt: string;
	}[] = [];

	if (platform?.env.DB) {
		const db = getDb(platform.env.DB);
		suggestions = await db
			.select()
			.from(authorSuggestions)
			.where(eq(authorSuggestions.userId, locals.user.id))
			.orderBy(desc(authorSuggestions.createdAt));
	}

	return { suggestions };
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB)
			return fail(500, { error: 'Datenbank nicht verfügbar.', name: '', note: '' });

		const data = await request.formData();
		const suggestedName = (data.get('name') as string)?.trim();
		const note = (data.get('note') as string)?.trim() || null;

		if (!suggestedName || suggestedName.length < 2) {
			return fail(400, {
				error: 'Bitte gib einen Autorennamen ein.',
				name: suggestedName ?? '',
				note: note ?? '',
			});
		}

		const db = getDb(platform.env.DB);
		await db.insert(authorSuggestions).values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			suggestedName,
			note,
		});

		return { success: true };
	},
};
