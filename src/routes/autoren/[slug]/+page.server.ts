import { error } from '@sveltejs/kit';
import { getAuthor, getGenre, getWorksByAuthor } from '$lib/server/data';
import { getWorkReviewStats } from '$lib/server/db';
import { getWikipediaImageUrl } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Autor nicht gefunden');

	const kv = platform?.env.SESSION_KV;

	const authorWorks = getWorksByAuthor(author.id);
	const [stats, imageUrl] = await Promise.all([
		platform?.env.DB
			? getWorkReviewStats(
					platform.env.DB,
					authorWorks.map((w) => w.id),
					kv,
				).catch(() => new Map())
			: new Map(),
		getWikipediaImageUrl(author.name, kv),
	]);

	const works = authorWorks.map((w) => {
		const s = stats.get(w.id);
		return {
			...w,
			genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
			reviewCount: s?.reviewCount ?? 0,
			avgRating: s?.avgRating ?? null,
			totalPoints: s?.totalPoints ?? 0,
		};
	});

	const wikiUrl = `https://de.wikipedia.org/wiki/${encodeURIComponent(author.name.replace(/ /g, '_'))}`;

	return { author, works, imageUrl, wikiUrl };
};
