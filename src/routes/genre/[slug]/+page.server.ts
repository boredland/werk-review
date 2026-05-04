import { error } from '@sveltejs/kit';
import { getAuthors, getGenre, getWorksByGenre } from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const genre = getGenre(params.slug);
	if (!genre) error(404, 'Genre nicht gefunden');

	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));

	const genreWorks = getWorksByGenre(genre.id);
	const stats = platform?.env.DB
		? await getWorkReviewStats(
				platform.env.DB,
				genreWorks.map((w) => w.id),
				platform.env.SESSION_KV,
			).catch(() => new Map())
		: new Map();

	const works = genreWorks.map((w) => {
		const s = stats.get(w.id);
		return {
			...w,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			author_slug: authorMap.get(w.author_id)?.slug ?? '',
			reviewCount: s?.reviewCount ?? 0,
			avgRating: s?.avgRating ?? null,
			totalPoints: s?.totalPoints ?? 0,
		};
	});

	return { genre, works };
};
