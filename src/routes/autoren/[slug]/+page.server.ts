import { error } from '@sveltejs/kit';
import { getAuthor, getGenre, getWorksByAuthor } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const works = getWorksByAuthor(author.id).map((w) => ({
		...w,
		genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
	}));

	return { author, works };
};
