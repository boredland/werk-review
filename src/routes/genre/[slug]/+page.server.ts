import { error } from '@sveltejs/kit';
import { getGenre, getWorksByGenre, getAuthors } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const genre = getGenre(params.slug);
	if (!genre) error(404, 'Genre nicht gefunden');

	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));

	const works = getWorksByGenre(genre.id).map((w) => ({
		...w,
		author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
		author_slug: authorMap.get(w.author_id)?.slug ?? ''
	}));

	return { genre, works };
};
