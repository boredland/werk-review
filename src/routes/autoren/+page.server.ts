import { getAuthors, getWorksByAuthor } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const authors = getAuthors().map((a) => ({
		...a,
		workCount: getWorksByAuthor(a.id).length,
	}));

	return { authors };
};
