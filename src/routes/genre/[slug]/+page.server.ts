import { error } from '@sveltejs/kit';
import {
	getAuthors,
	getCollectionType,
	getGenre,
	getWorksByGenre,
	rollUpStats,
} from '$lib/server/data';
import { getAllWorkReviewStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const genre = getGenre(params.slug);
	if (!genre) error(404, 'Genre nicht gefunden');

	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));

	const genreWorks = getWorksByGenre(genre.id).filter((w) => getCollectionType(w) !== 'band');
	const stats = platform?.env.DB
		? await getAllWorkReviewStats(platform.env.DB, platform.env.SESSION_KV).catch(() => new Map())
		: new Map();

	const works = genreWorks.map((w) => {
		const s = rollUpStats(w.id, stats);
		return {
			...w,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			author_slug: authorMap.get(w.author_id)?.slug ?? '',
			reviewCount: s.reviewCount,
			avgRating: s.avgRating,
			totalPoints: s.totalPoints,
		};
	});

	return { genre, works };
};
