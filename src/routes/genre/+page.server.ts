import { getGenres, getWorksByGenre } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const genres = getGenres().map((g) => ({
		...g,
		workCount: getWorksByGenre(g.id).length,
	}));

	return { genres };
};
