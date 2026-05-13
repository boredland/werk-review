import { error } from '@sveltejs/kit';
import {
	getAuthor,
	getCollectionType,
	getGenre,
	getWorksByAuthor,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrl } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, url }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const kv = platform?.env.SESSION_KV;
	const forceRefresh = url.searchParams.get('refresh') === 'true';

	const authorWorks = getWorksByAuthor(author.id).filter((w) => getCollectionType(w) !== 'band');
	const statsIds = withDescendantIds(authorWorks.map((w) => w.id));
	const [stats, imageUrl] = await Promise.all([
		platform?.env.DB
			? getWorkReviewStats(platform.env.DB, statsIds, kv).catch(() => new Map())
			: new Map(),
		getWikipediaImageUrl(author.name, forceRefresh ? undefined : kv),
	]);

	const works = authorWorks.map((w) => {
		const s = rollUpStats(w.id, stats);
		return {
			...w,
			genre_name: w.genre_ids
				.map((id) => getGenre(id)?.name)
				.filter(Boolean)
				.join(', '),
			reviewCount: s.reviewCount,
			avgRating: s.avgRating,
			totalPoints: s.totalPoints,
		};
	});

	const wikiUrl = `https://de.wikipedia.org/wiki/${encodeURIComponent(author.name.replace(/ /g, '_'))}`;

	return {
		author,
		works,
		imageUrl,
		wikiUrl,
	};
};
