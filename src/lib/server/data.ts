import type { Author, ExternalLink, Genre, SimilarWork, Work } from '$lib/types';

const authorModules = import.meta.glob<Author>('/data/authors/*.json', {
	eager: true,
	import: 'default',
});
const workModules = import.meta.glob<Work>('/data/works/*.json', {
	eager: true,
	import: 'default',
});
const genresModule = import.meta.glob<Genre[]>('/data/genres.json', {
	eager: true,
	import: 'default',
});
const linkModules = import.meta.glob<ExternalLink[]>('/data/links/*.json', {
	eager: true,
	import: 'default',
});

function loadAll<T>(modules: Record<string, T>): T[] {
	return Object.values(modules);
}

let _authors: Author[] | null = null;
let _works: Work[] | null = null;
let _genres: Genre[] | null = null;
let _similarities: Map<string, SimilarWork[]> | null = null;

export function getAuthors(): Author[] {
	if (!_authors) {
		_authors = loadAll(authorModules).sort((a, b) => a.name.localeCompare(b.name, 'de'));
	}
	return _authors;
}

export function getAuthor(idOrSlug: string): Author | undefined {
	return getAuthors().find((a) => a.id === idOrSlug || a.slug === idOrSlug);
}

export function getWorks(): Work[] {
	if (!_works) {
		_works = loadAll(workModules).sort((a, b) => {
			const yearA = a.year_from ?? 9999;
			const yearB = b.year_from ?? 9999;
			return yearA - yearB || a.title.localeCompare(b.title, 'de');
		});
	}
	return _works;
}

export function getWork(idOrSlug: string): Work | undefined {
	return getWorks().find((w) => w.id === idOrSlug || w.slug === idOrSlug);
}

export function getWorksByAuthor(authorId: string): Work[] {
	return getWorks().filter((w) => w.author_id === authorId);
}

export function getWorksByGenre(genreId: string): Work[] {
	return getWorks().filter((w) => w.genre_ids.includes(genreId));
}

export function getGenres(): Genre[] {
	if (!_genres) {
		const entries = Object.values(genresModule);
		_genres = entries[0] ?? [];
	}
	return _genres;
}

export function getGenre(idOrSlug: string): Genre | undefined {
	return getGenres().find((g) => g.id === idOrSlug || g.slug === idOrSlug);
}

let _links: Map<string, ExternalLink[]> | null = null;

export function getLinksForWork(work: Work): ExternalLink[] {
	if (!_links) {
		_links = new Map();
		for (const [path, links] of Object.entries(linkModules)) {
			const filename = path.split('/').pop()?.replace('.json', '') ?? '';
			_links.set(filename, links);
		}
	}
	const enrichedLinks = _links.get(work.slug) ?? [];
	const manualLinks = (work.sources ?? []) as ExternalLink[];

	const generatedLinks: ExternalLink[] = [];
	if (work.gnd_id) {
		generatedLinks.push({
			source: 'DNB',
			label: 'Deutsche Nationalbibliothek',
			url: `https://d-nb.info/gnd/${work.gnd_id}`,
			format: 'Katalogeintrag',
		});
	}

	const author = getAuthor(work.author_id);
	if (author?.gnd_id) {
		generatedLinks.push({
			source: 'DNB',
			label: `DNB: ${author.name}`,
			url: `https://d-nb.info/gnd/${author.gnd_id}`,
			format: 'Personeneintrag',
		});
	}

	// Deduplicate by URL
	const seenUrls = new Set([...manualLinks, ...generatedLinks].map((l) => l.url));
	const uniqueEnriched = enrichedLinks.filter((l) => !seenUrls.has(l.url));

	return [...manualLinks, ...generatedLinks, ...uniqueEnriched];
}

export function getSimilarWorks(workId: string): SimilarWork[] {
	if (!_similarities) {
		_similarities = computeSimilarities();
	}
	return _similarities.get(workId) ?? [];
}

function computeSimilarities(): Map<string, SimilarWork[]> {
	const works = getWorks();
	const result = new Map<string, SimilarWork[]>();

	for (const work of works) {
		const scores: { work_id: string; score: number }[] = [];

		for (const other of works) {
			if (other.id === work.id) continue;

			let score = 0;
			if (other.genre_ids.some((g) => work.genre_ids.includes(g))) score += 3;
			if (work.year_from && other.year_from && Math.abs(work.year_from - other.year_from) <= 25)
				score += 2;
			if (other.author_id === work.author_id) score += 1;

			if (score > 0) {
				scores.push({ work_id: other.id, score });
			}
		}

		scores.sort((a, b) => b.score - a.score);
		result.set(work.id, scores.slice(0, 5));
	}

	return result;
}
