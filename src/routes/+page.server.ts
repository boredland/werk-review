import { getAuthors, getWorks, getGenres } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const authors = getAuthors();
	const works = getWorks();
	const genres = getGenres();

	const recentWorks = works.slice(0, 6);

	return { authors, recentWorks, genres, totalWorks: works.length };
};
