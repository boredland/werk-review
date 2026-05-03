import { fail } from '@sveltejs/kit';
import { getAuthor, getAuthors } from '$lib/server/data';
import type { Actions, PageServerLoad } from './$types';

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const load: PageServerLoad = () => {
	return { authors: getAuthors() };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const bucket = platform?.env.IMAGES;
		if (!bucket) return fail(503, { error: 'Bildspeicher nicht verfügbar' });

		const formData = await request.formData();
		const authorId = formData.get('author_id') as string;
		const file = formData.get('photo') as File;

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

		return { success: true, key, authorName: author.name };
	},
};
