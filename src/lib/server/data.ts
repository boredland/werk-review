import {
	authorIndex,
	authors,
	children,
	collectionTypes,
	descendants,
	fortsetzung,
	genreIndex,
	genres,
	links,
	similar,
	workIndex,
	works,
	worksByAuthor,
	worksByGenre,
} from 'virtual:werk-data';
import type { Author, CollectionType, ExternalLink, Genre, WorkMeta } from '$lib/types';
import type { WorkReviewStats } from './db';

const NO_NEIGHBORS = { predecessors: [], successors: [] };
const EMPTY_IDS: string[] = [];
const EMPTY_LINKS: ExternalLink[] = [];
const EMPTY_WORKS: WorkMeta[] = [];
const EMPTY_STATS: WorkReviewStats = { reviewCount: 0, avgRating: null, totalPoints: 0 };

export function getAuthors(): Author[] {
	return authors;
}

export function getAuthor(idOrSlug: string): Author | undefined {
	const i = authorIndex[idOrSlug];
	return i === undefined ? undefined : authors[i];
}

export function getWorks(): WorkMeta[] {
	return works;
}

export function getWork(idOrSlug: string): WorkMeta | undefined {
	const i = workIndex[idOrSlug];
	return i === undefined ? undefined : works[i];
}

export function getWorksByAuthor(authorId: string): WorkMeta[] {
	const idx = worksByAuthor[authorId];
	return idx ? idx.map((i) => works[i]) : EMPTY_WORKS;
}

export function getWorksByGenre(genreId: string): WorkMeta[] {
	const idx = worksByGenre[genreId];
	return idx ? idx.map((i) => works[i]) : EMPTY_WORKS;
}

export function getGenres(): Genre[] {
	return genres;
}

export function getGenre(idOrSlug: string): Genre | undefined {
	const i = genreIndex[idOrSlug];
	return i === undefined ? undefined : genres[i];
}

export function getLinksForWork(work: WorkMeta): ExternalLink[] {
	const enriched = links[work.slug];
	// `sources` carries only label and url; the UI treats the missing
	// source/format fields as optional for manually curated entries.
	const manual = (work.sources ?? EMPTY_LINKS) as ExternalLink[];

	if (!enriched) return manual;
	if (manual.length === 0) return enriched;

	const seenUrls = new Set(manual.map((l) => l.url));
	return [...manual, ...enriched.filter((l) => !seenUrls.has(l.url))];
}

export function getCollectionType(work: WorkMeta): CollectionType {
	return collectionTypes[work.id] ?? 'standalone';
}

export function getChildWorkIds(workId: string): string[] {
	return children[workId] ?? EMPTY_IDS;
}

export function getFortsetzungNeighbors(workId: string) {
	return fortsetzung[workId] ?? NO_NEIGHBORS;
}

export function getDescendantWorkIds(workId: string): string[] {
	return descendants[workId] ?? EMPTY_IDS;
}

/**
 * Expands a list of work ids with every descendant, allocating only when at
 * least one input actually has children — the common case on listing pages is
 * that none do.
 */
export function withDescendantIds(workIds: string[]): string[] {
	let expanded: Set<string> | null = null;
	for (const id of workIds) {
		const ids = descendants[id];
		if (!ids) continue;
		expanded ??= new Set(workIds);
		for (const childId of ids) expanded.add(childId);
	}
	return expanded ? Array.from(expanded) : workIds;
}

export function rollUpStats(
	workId: string,
	rawStats: Map<string, WorkReviewStats>,
): WorkReviewStats {
	const own = rawStats.get(workId) ?? EMPTY_STATS;
	const ids = descendants[workId];
	if (!ids) return own;

	let reviewCount = own.reviewCount;
	let totalPoints = own.totalPoints;
	for (const id of ids) {
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

export function getSimilarWorks(workId: string): WorkMeta[] {
	const idx = similar[workId];
	return idx ? idx.map((i) => works[i]) : EMPTY_WORKS;
}
