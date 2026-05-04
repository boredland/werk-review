import { getAuthors, getWorksByAuthor } from '$lib/server/data';
import { getAuthorReviewStats } from '$lib/server/db';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const kv = platform?.env.SESSION_KV;
	const workIdsByAuthor = new Map<string, string[]>();
	for (const a of allAuthors) {
		workIdsByAuthor.set(
			a.id,
			getWorksByAuthor(a.id).map((w) => w.id),
		);
	}

	const [imageUrls, stats] = await Promise.all([
		getWikipediaImageUrls(
			allAuthors.map((a) => a.name),
			kv,
		),
		platform?.env.DB
			? getAuthorReviewStats(platform.env.DB, workIdsByAuthor, kv).catch(() => new Map())
			: new Map(),
	]);

	let authors = allAuthors.map((a) => {
		const s = stats.get(a.id);
		return {
			...a,
			workCount: workIdsByAuthor.get(a.id)?.length ?? 0,
			imageUrl: imageUrls.get(a.name) ?? null,
			totalPoints: s?.totalPoints ?? 0,
			recommendations: s?.recommendations ?? 0,
			rank: 0,
		};
	});

	// Calculate ranking based on total points
	authors.sort((a, b) => {
		if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
		if (b.recommendations !== a.recommendations) return b.recommendations - a.recommendations;
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
