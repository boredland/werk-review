import { getAuthors, getGenre, getGenres, getWorks } from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));
	const genres = getGenres();

	const allWorks = getWorks();
	const stats = platform?.env.DB
		? await getWorkReviewStats(
				platform.env.DB,
				allWorks.map((w) => w.id),
				platform.env.SESSION_KV,
			).catch(() => new Map())
		: new Map();

	const works = allWorks.map((w) => {
		const s = stats.get(w.id);
		return {
			...w,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			author_slug: authorMap.get(w.author_id)?.slug ?? '',
			genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
			reviewCount: s?.reviewCount ?? 0,
			avgRating: s?.avgRating ?? null,
		};
	});

	return { works, genres };
};
