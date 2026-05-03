import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { authorPhotos } from '$lib/db/schema';
import { getAuthor, getGenre, getWorksByAuthor } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const works = getWorksByAuthor(author.id).map((w) => ({
		...w,
		genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
	}));

	let photoMeta: {
		description: string | null;
		sourceLabel: string | null;
		sourceUrl: string | null;
		r2Key: string;
	} | null = null;

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const row = await db
				.select({
					r2Key: authorPhotos.r2Key,
					description: authorPhotos.description,
					sourceLabel: authorPhotos.sourceLabel,
					sourceUrl: authorPhotos.sourceUrl,
				})
				.from(authorPhotos)
				.where(eq(authorPhotos.authorId, author.id))
				.get();
			if (row) photoMeta = row;
		} catch {
			// D1 not available locally or table missing
		}
	}

	return { author, works, photoMeta };
};
