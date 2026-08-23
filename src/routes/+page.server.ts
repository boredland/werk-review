import { getAuthors, getCollectionType, getGenres, getWorks, rollUpStats } from '$lib/server/data';
import { getAllWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const works = getWorks();
	const genres = getGenres();
	const kv = platform?.env.SESSION_KV;

	const displayedAuthors = allAuthors.slice(0, 6);
	const recentWorksRaw = works.filter((w) => getCollectionType(w) !== 'band').slice(0, 6);

	const [stats, imageUrls] = await Promise.all([
		platform?.env.DB
			? getAllWorkReviewStats(platform.env.DB, kv).catch(() => new Map())
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
