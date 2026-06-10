import { error } from '@sveltejs/kit';
import {
	getAuthor,
	getCollectionType,
	getGenre,
	getWork,
	getWorksByAuthor,
	rollUpStats,
	withDescendantIds,
} from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import {
	getWikipediaImageUrl,
	resolveWikipediaTitle,
	wikipediaPageUrl,
} from '$lib/server/wikipedia';
import type { Work } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, url }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const kv = platform?.env.SESSION_KV;
	const forceRefresh = url.searchParams.get('refresh') === 'true';

	const isRomanreihe = (w: Work) => w.genre_ids.includes('romanreihe');
	const romanreiheParent = (w: Work) => {
		for (const slug of w.parent_slugs ?? []) {
			const parent = getWork(slug);
			if (parent && isRomanreihe(parent)) return { title: parent.title, slug: parent.slug };
		}
		return null;
	};

	// A "Romanreihe" (e.g. the Drei-Musketiere cycle) is hidden as its own row;
	// its member novels are listed instead with a link back to the series.
	// Members of a regular Sammlung/Erzählband (parent is not a Romanreihe) stay
	// collapsed into the collection as before.
	const authorWorks = getWorksByAuthor(author.id).filter((w) => {
		if (isRomanreihe(w)) return false;
		if (getCollectionType(w) === 'band') return !!romanreiheParent(w);
		return true;
	});
	const statsIds = withDescendantIds(authorWorks.map((w) => w.id));
	const imageKv = forceRefresh ? undefined : kv;
	const wikiTitle = await resolveWikipediaTitle(author, imageKv);
	const [stats, imageUrl] = await Promise.all([
		platform?.env.DB
			? getWorkReviewStats(platform.env.DB, statsIds, kv).catch(() => new Map())
			: new Map(),
		getWikipediaImageUrl(author.name, imageKv, wikiTitle),
	]);

	const works = authorWorks
		.map((w) => {
			const s = rollUpStats(w.id, stats);
			return {
				...w,
				genre_name: w.genre_ids
					.map((id) => getGenre(id)?.name)
					.filter(Boolean)
					.join(', '),
				parentSeries: romanreiheParent(w),
				reviewCount: s.reviewCount,
				avgRating: s.avgRating,
				totalPoints: s.totalPoints,
			};
		})
		.sort((a, b) => {
			const aHasRating = a.reviewCount > 0;
			const bHasRating = b.reviewCount > 0;
			if (aHasRating !== bHasRating) return aHasRating ? -1 : 1;
			if (aHasRating && bHasRating) return b.totalPoints - a.totalPoints;
			return (a.year ?? 9999) - (b.year ?? 9999);
		});

	const authorReviewCount = works.reduce((sum, w) => sum + w.reviewCount, 0);
	const authorTotalPoints = works.reduce((sum, w) => sum + w.totalPoints, 0);
	const authorAvgRating = authorReviewCount > 0 ? authorTotalPoints / authorReviewCount : null;

	const wikiUrl = wikipediaPageUrl(wikiTitle);

	return {
		author,
		works,
		imageUrl,
		wikiUrl,
		authorReviewCount,
		authorTotalPoints,
		authorAvgRating,
	};
};
