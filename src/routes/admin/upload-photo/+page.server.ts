import { fail } from '@sveltejs/kit';
import { authorPhotos } from '$lib/db/schema';
import { getAuthor, getAuthors } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const load: PageServerLoad = () => {
	return { authors: getAuthors() };
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		const bucket = platform?.env.IMAGES;
		const d1 = platform?.env.DB;
		if (!bucket || !d1) return fail(503, { error: 'Speicher nicht verfügbar' });

		const formData = await request.formData();
		const authorId = formData.get('author_id') as string;
		const file = formData.get('photo') as File;
		const description = (formData.get('description') as string)?.trim() || null;
		const sourceLabel = (formData.get('source_label') as string)?.trim() || null;
		const sourceUrl = (formData.get('source_url') as string)?.trim() || null;

		if (!authorId || !file || file.size === 0) {
			return fail(400, { error: 'Autor und Bild sind erforderlich' });
		}

		const author = getAuthor(authorId);
		if (!author) return fail(400, { error: 'Autor nicht gefunden' });

		if (!ALLOWED_TYPES.includes(file.type)) {
			return fail(400, { error: 'Nur JPEG, PNG und WebP erlaubt' });
		}

		if (file.size > MAX_SIZE) {
			return fail(400, { error: 'Bild darf maximal 2 MB groß sein' });
		}

		const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
		const key = `authors/${author.slug}.${ext}`;

		await bucket.put(key, await file.arrayBuffer(), {
			httpMetadata: { contentType: file.type },
		});

		const db = getDb(d1);
		await db
			.insert(authorPhotos)
			.values({
				authorId: author.id,
				r2Key: key,
				description,
				sourceLabel,
				sourceUrl,
				uploadedBy: locals.user?.id ?? null,
			})
			.onConflictDoUpdate({
				target: authorPhotos.authorId,
				set: {
					r2Key: key,
					description,
					sourceLabel,
					sourceUrl,
					uploadedBy: locals.user?.id ?? null,
				},
			});

		return { success: true, key, authorName: author.name };
	},
};
