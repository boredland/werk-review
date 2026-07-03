import {
	getAuthors,
	getCollectionType,
	getWorksByAuthor,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const kv = platform?.env.SESSION_KV;

	const worksByAuthor = new Map(
		allAuthors.map((a) => [
			a.id,
			getWorksByAuthor(a.id).filter((w) => getCollectionType(w) !== 'band'),
		]),
	);
	const allStatsIds = withDescendantIds(
		Array.from(worksByAuthor.values())
			.flat()
			.map((w) => w.id),
	);

	const [imageUrls, workStats] = await Promise.all([
		getWikipediaImageUrls(allAuthors, kv),
		platform?.env.DB
			? getWorkReviewStats(platform.env.DB, allStatsIds, kv).catch(() => new Map())
			: new Map(),
	]);

	const authors = allAuthors.map((a) => {
		const authorWorks = worksByAuthor.get(a.id) ?? [];
		let totalPoints = 0;
		let reviewCount = 0;
		for (const w of authorWorks) {
			const s = rollUpStats(w.id, workStats);
			totalPoints += s.totalPoints;
			reviewCount += s.reviewCount;
		}
		return {
			...a,
			workCount: getWorksByAuthor(a.id).filter((w) => !w.genre_ids.includes('romanzyklus')).length,
			imageUrl: imageUrls.get(a.name) ?? null,
			totalPoints,
			reviewCount,
			avgRating: reviewCount > 0 ? totalPoints / reviewCount : null,
			rank: 0,
		};
	});

	authors.sort((a, b) => {
		if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
		if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
		return a.name.localeCompare(b.name, 'de');
	});

	// Assign ranks (handle ties)
	let currentRank = 1;
	for (let i = 0; i < authors.length; i++) {
		if (i > 0 && authors[i].totalPoints < authors[i - 1].totalPoints) {
			currentRank = i + 1;
		}
		authors[i].rank = currentRank;
	}

	return { authors };
};
