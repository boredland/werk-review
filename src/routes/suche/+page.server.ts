import { getAuthors, getGenre, getGenres, getWorks } from '$lib/server/data';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	if (!q) return { query: '', authors: [], works: [], genres: [] };

	const lower = q.toLowerCase();

	const authors = getAuthors()
		.filter(
			(a) =>
				a.name.toLowerCase().includes(lower) ||
				a.aliases.some((al) => al.toLowerCase().includes(lower)),
		)
		.map((a) => ({ name: a.name, slug: a.slug }));

	const allAuthors = getAuthors();
	const authorMap = new Map(allAuthors.map((a) => [a.id, a]));

	const allWorks = getWorks();
	const workMap = new Map(allWorks.map((w) => [w.id, w]));

	const works = allWorks
		.filter(
			(w) =>
				w.title.toLowerCase().includes(lower) ||
				w.aliases.some((al) => al.toLowerCase().includes(lower)) ||
				w.parent_slugs.some((pSlug) => workMap.get(pSlug)?.title.toLowerCase().includes(lower)) ||
				(w.plot?.toLowerCase().includes(lower) ?? false),
		)
		.map((w) => ({
			title: w.title,
			slug: w.slug,
			year_display: w.year_display,
			author_name: authorMap.get(w.author_id)?.name ?? 'Unbekannt',
			genre_name: getGenre(w.genre_id)?.name ?? w.genre_id,
		}));

	const genres = getGenres()
		.filter((g) => g.name.toLowerCase().includes(lower))
		.map((g) => ({ name: g.name, slug: g.slug }));

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
