import {
	getAuthors,
	getCollectionType,
	getGenre,
	getGenres,
	getWorks,
	rollUpStats,
} from '$lib/server/data';
import { getAllWorkReviewStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));
	const genres = getGenres();

	const allWorks = getWorks().filter((w) => getCollectionType(w) !== 'band');
	const stats = platform?.env.DB
		? await getAllWorkReviewStats(platform.env.DB, platform.env.SESSION_KV).catch(() => new Map())
		: new Map();

	const works = allWorks.map((w) => {
		const s = rollUpStats(w.id, stats);
		const author = authorMap.get(w.author_id);
		return {
			slug: w.slug,
			title: w.title,
			aliases: w.aliases,
			year: w.year,
			year_display: w.year_display,
			genre_ids: w.genre_ids,
			author_name: author?.name ?? 'Unbekannt',
			author_slug: author?.slug ?? '',
			genre_name: w.genre_ids
				.map((id) => getGenre(id)?.name)
				.filter(Boolean)
				.join(', '),
			reviewCount: s.reviewCount,
			avgRating: s.avgRating,
			totalPoints: s.totalPoints,
		};
	});

	return { works, genres };
};
