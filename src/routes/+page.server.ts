import { getAuthors, getGenres, getWorks } from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const works = getWorks();
	const genres = getGenres();
	const kv = platform?.env.SESSION_KV;

	const displayedAuthors = allAuthors.slice(0, 6);
	const recentWorksRaw = works.slice(0, 6);

	const [stats, imageUrls] = await Promise.all([
		platform?.env.DB
			? getWorkReviewStats(
					platform.env.DB,
					recentWorksRaw.map((w) => w.id),
					kv,
				).catch(() => new Map())
			: new Map(),
		getWikipediaImageUrls(
			displayedAuthors.map((a) => a.name),
			kv,
		),
	]);

	const authors = displayedAuthors.map((a) => ({
		...a,
		imageUrl: imageUrls.get(a.name) ?? null,
	}));

	const recentWorks = recentWorksRaw.map((w) => {
		const s = stats.get(w.id);
		return {
			...w,
			reviewCount: s?.reviewCount ?? 0,
			avgRating: s?.avgRating ?? null,
			totalPoints: s?.totalPoints ?? 0,
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
