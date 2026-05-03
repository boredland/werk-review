import { getAuthors, getGenre, getGenres, getWorks } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));
	const genres = getGenres();

	const works = getWorks().map((w) => ({
		...w,
		author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
		author_slug: authorMap.get(w.author_id)?.slug ?? '',
		genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
	}));

	return { works, genres };
};
