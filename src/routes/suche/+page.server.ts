import { getAuthors, getGenre, getGenres, getWorks } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
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

	const works = getWorks()
		.filter(
			(w) =>
				w.title.toLowerCase().includes(lower) ||
				w.aliases.some((al) => al.toLowerCase().includes(lower)) ||
				(w.collection_title?.toLowerCase().includes(lower) ?? false),
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

	return { query: q, authors, works, genres };
};
