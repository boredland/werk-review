import {
	getAuthors,
	getCollectionType,
	getGenre,
	getGenres,
	getWorks,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const authors = getAuthors();
	const authorMap = new Map(authors.map((a) => [a.id, a]));
	const genres = getGenres();

	const allWorks = getWorks().filter((w) => getCollectionType(w) !== 'band');
	const statsIds = withDescendantIds(allWorks.map((w) => w.id));
	const stats = platform?.env.DB
		? await getWorkReviewStats(platform.env.DB, statsIds, platform.env.SESSION_KV).catch(
				() => new Map(),
			)
		: new Map();

	const works = allWorks.map((w) => {
		const s = rollUpStats(w.id, stats);
		return {
			...w,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			author_slug: authorMap.get(w.author_id)?.slug ?? '',
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
