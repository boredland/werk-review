import {
	getAuthors,
	getCollectionType,
	getGenres,
	getWorks,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const works = getWorks();
	const genres = getGenres();
	const kv = platform?.env.SESSION_KV;

	const displayedAuthors = allAuthors.slice(0, 6);
	const visibleWorks = works.filter((w) => getCollectionType(w) !== 'band');
	const recentWorksRaw = visibleWorks.slice(0, 6);
	const statsIds = withDescendantIds(recentWorksRaw.map((w) => w.id));

	const [stats, imageUrls] = await Promise.all([
		platform?.env.DB
			? getWorkReviewStats(platform.env.DB, statsIds, kv).catch(() => new Map())
			: new Map(),
		getWikipediaImageUrls(displayedAuthors, kv),
	]);

	const authors = displayedAuthors.map((a) => ({
		...a,
		imageUrl: imageUrls.get(a.name) ?? null,
	}));

	const recentWorks = recentWorksRaw.map((w) => {
		const s = rollUpStats(w.id, stats);
		return {
			...w,
			reviewCount: s.reviewCount,
			avgRating: s.avgRating,
			totalPoints: s.totalPoints,
		};
	});

	return {
		authors,
		recentWorks,
		genres,
		totalWorks: works.length,
		totalAuthors: allAuthors.length,
	};
};
