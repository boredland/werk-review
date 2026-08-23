import { error } from '@sveltejs/kit';
import {
	getAuthor,
	getCollectionType,
	getGenre,
	getWork,
	getWorksByAuthor,
	rollUpStats,
} from '$lib/server/data';
import { getAllWorkReviewStats } from '$lib/server/db';
import {
	getWikipediaImageUrl,
	resolveWikipediaTitle,
	wikipediaPageUrl,
} from '$lib/server/wikipedia';
import type { WorkMeta } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, url }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const kv = platform?.env.SESSION_KV;
	const forceRefresh = url.searchParams.get('refresh') === 'true';

	const isRomanzyklus = (w: WorkMeta) => w.genre_ids.includes('romanzyklus');
	const zyklusParent = (w: WorkMeta) => {
		for (const slug of w.parent_slugs ?? []) {
			const parent = getWork(slug);
			if (parent && isRomanzyklus(parent)) return { title: parent.title, slug: parent.slug };
		}
		return null;
	};

	// A "Romanzyklus" (e.g. the Drei-Musketiere cycle) is hidden as its own row;
	// its member novels are listed instead with a link back to the cycle.
	// Members of a regular Sammlung/Erzählband (parent is not a Romanzyklus) stay
	// collapsed into the collection as before.
	const authorWorks = getWorksByAuthor(author.id).filter((w) => {
		if (isRomanzyklus(w)) return false;
		if (getCollectionType(w) === 'band') return !!zyklusParent(w);
		return true;
	});
	const imageKv = forceRefresh ? undefined : kv;
	const wikiTitle = await resolveWikipediaTitle(author, imageKv);
	const [stats, imageUrl] = await Promise.all([
		platform?.env.DB
			? getAllWorkReviewStats(platform.env.DB, kv).catch(() => new Map())
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
				parentSeries: zyklusParent(w),
				reviewCount: s.reviewCount,
				avgRating: s.avgRating,
				totalPoints: s.totalPoints,
			};
		})
		.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title, 'de'));

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
