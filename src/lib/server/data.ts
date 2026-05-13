import type { Author, CollectionType, ExternalLink, Genre, SimilarWork, Work } from '$lib/types';
import type { WorkReviewStats } from './db';

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
let _fortsetzungIndex: Map<string, { predecessors: string[]; successors: string[] }> | null = null;
let _childIndex: Map<string, string[]> | null = null;

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
			const yearA = a.year ?? 9999;
			const yearB = b.year ?? 9999;
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

	// Deduplicate by URL
	const seenUrls = new Set(manualLinks.map((l) => l.url));
	const uniqueEnriched = enrichedLinks.filter((l) => !seenUrls.has(l.url));

	return [...manualLinks, ...uniqueEnriched];
}

function getFortsetzungIndex() {
	if (!_fortsetzungIndex) {
		const idx = new Map<string, { predecessors: string[]; successors: string[] }>();
		const ensure = (id: string) => {
			let entry = idx.get(id);
			if (!entry) {
				entry = { predecessors: [], successors: [] };
				idx.set(id, entry);
			}
			return entry;
		};
		for (const w of getWorks()) {
			const entry = ensure(w.id);
			for (const predId of w.fortsetzung_von_ids ?? []) {
				entry.predecessors.push(predId);
				ensure(predId).successors.push(w.id);
			}
		}
		_fortsetzungIndex = idx;
	}
	return _fortsetzungIndex;
}

function getChildIndex() {
	if (!_childIndex) {
		const idx = new Map<string, string[]>();
		for (const w of getWorks()) {
			for (const parentId of w.parent_slugs ?? []) {
				const list = idx.get(parentId) ?? [];
				list.push(w.id);
				idx.set(parentId, list);
			}
		}
		_childIndex = idx;
	}
	return _childIndex;
}

export function getCollectionType(work: Work): CollectionType {
	const chain = getFortsetzungIndex().get(work.id);
	const hasChain = !!chain && (chain.predecessors.length > 0 || chain.successors.length > 0);
	const hasParent = (work.parent_slugs?.length ?? 0) > 0;
	if (hasParent && hasChain) return 'zyklus';
	if (hasParent) return 'band';
	if (hasChain) return 'reihe';
	return 'standalone';
}

export function getChildWorkIds(workId: string): string[] {
	return getChildIndex().get(workId) ?? [];
}

export function getFortsetzungNeighbors(workId: string) {
	return getFortsetzungIndex().get(workId) ?? { predecessors: [], successors: [] };
}

export function withDescendantIds(workIds: string[]): string[] {
	const out = new Set<string>(workIds);
	for (const id of workIds) {
		for (const d of getDescendantWorkIds(id)) out.add(d);
	}
	return Array.from(out);
}

const EMPTY_STATS: WorkReviewStats = { reviewCount: 0, avgRating: null, totalPoints: 0 };

export function rollUpStats(
	workId: string,
	rawStats: Map<string, WorkReviewStats>,
): WorkReviewStats {
	const own = rawStats.get(workId) ?? EMPTY_STATS;
	const descendants = getDescendantWorkIds(workId);
	if (descendants.length === 0) return own;
	let reviewCount = own.reviewCount;
	let totalPoints = own.totalPoints;
	for (const id of descendants) {
		const s = rawStats.get(id);
		if (!s) continue;
		reviewCount += s.reviewCount;
		totalPoints += s.totalPoints;
	}
	return {
		reviewCount,
		totalPoints,
		avgRating: reviewCount > 0 ? totalPoints / reviewCount : null,
	};
}

export function getDescendantWorkIds(workId: string): string[] {
	const result = new Set<string>();
	const queue = [workId];
	const visited = new Set<string>([workId]);
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;
		for (const childId of getChildWorkIds(current)) {
			if (visited.has(childId)) continue;
			visited.add(childId);
			result.add(childId);
			queue.push(childId);
		}
	}
	return Array.from(result);
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
			if (work.year && other.year && Math.abs(work.year - other.year) <= 25) score += 2;
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
