import Fuse from 'fuse.js';
import { getAuthors, getGenre, getGenres, getWorks } from '$lib/server/data';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	if (!q) return { query: '', authors: [], works: [], genres: [] };

	const allAuthors = getAuthors();
	const authorMap = new Map(allAuthors.map((a) => [a.id, a]));
	const authorFuse = new Fuse(allAuthors, {
		keys: ['name', 'aliases'],
		threshold: 0.3,
	});
	const authors = authorFuse.search(q).map((res) => ({ name: res.item.name, slug: res.item.slug }));

	const allWorks = getWorks();
	const workMap = new Map(allWorks.map((w) => [w.id, w]));
	const worksForSearch = allWorks.map((w) => ({
		...w,
		parent_titles: w.parent_slugs.map((pSlug) => workMap.get(pSlug)?.title).filter(Boolean),
	}));

	const workFuse = new Fuse(worksForSearch, {
		keys: [
			{ name: 'title', weight: 3 },
			{ name: 'aliases', weight: 2 },
			{ name: 'parent_titles', weight: 1.5 },
			{ name: 'plot', weight: 0.5 },
		],
		threshold: 0.3,
		ignoreLocation: true,
	});

	const works = workFuse.search(q).map((res) => {
		const w = res.item;
		return {
			title: w.title,
			slug: w.slug,
			year_display: w.year_display,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			genre_name: w.genre_ids
				.map((id) => getGenre(id)?.name)
				.filter(Boolean)
				.join(', '),
		};
	});

	const genresFuse = new Fuse(getGenres(), {
		keys: ['name'],
		threshold: 0.3,
	});
	const genres = genresFuse.search(q).map((res) => ({ name: res.item.name, slug: res.item.slug }));

	const imageUrls = await getWikipediaImageUrls(
		authors.map((a) => a.name),
		platform?.env.SESSION_KV,
	);

	const authorsWithImages = authors.map((a) => ({
		...a,
		imageUrl: imageUrls.get(a.name) ?? null,
	}));

	return { query: q, authors: authorsWithImages, works, genres };
};
