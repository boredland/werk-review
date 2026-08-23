import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import type { Author, CollectionType, ExternalLink, Genre, Work, WorkMeta } from '../src/lib/types';

const DATA_ID = 'virtual:werk-data';
const PLOTS_ID = 'virtual:werk-plots';

const SIMILAR_LIMIT = 5;
const SIMILAR_YEAR_WINDOW = 25;

type Chain = { predecessors: string[]; successors: string[] };

function readJsonDir<T>(dir: string): { name: string; data: T }[] {
	return readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => ({
			name: f.slice(0, -'.json'.length),
			data: JSON.parse(readFileSync(join(dir, f), 'utf8')) as T,
		}));
}

// Scores every ordered pair once and keeps the top N per work as position
// indices. Only the ranking survives — the scores themselves are never read at
// request time. Sort ties keep works order, matching the former runtime pass.
function computeSimilar(works: Work[]): Record<string, number[]> {
	const positions = new Map(works.map((w, i) => [w.id, i]));
	const similar: Record<string, number[]> = {};
	for (const work of works) {
		const scores: { id: string; score: number }[] = [];
		for (const other of works) {
			if (other.id === work.id) continue;
			let score = 0;
			if (other.genre_ids.some((g) => work.genre_ids.includes(g))) score += 3;
			if (work.year && other.year && Math.abs(work.year - other.year) <= SIMILAR_YEAR_WINDOW)
				score += 2;
			if (other.author_id === work.author_id) score += 1;
			if (score > 0) scores.push({ id: other.id, score });
		}
		scores.sort((a, b) => b.score - a.score);
		if (scores.length > 0) {
			similar[work.id] = scores.slice(0, SIMILAR_LIMIT).map((s) => positions.get(s.id) as number);
		}
	}
	return similar;
}

// Only works that actually participate in a continuation chain get an entry;
// callers fall back to a shared empty value.
function computeFortsetzung(works: Work[]): Record<string, Chain> {
	const index: Record<string, Chain> = {};
	const ensure = (id: string) => {
		const entry = index[id] ?? { predecessors: [], successors: [] };
		index[id] = entry;
		return entry;
	};
	for (const w of works) {
		for (const predId of w.fortsetzung_von_ids ?? []) {
			ensure(w.id).predecessors.push(predId);
			ensure(predId).successors.push(w.id);
		}
	}
	return index;
}

function computeChildren(works: Work[]): Record<string, string[]> {
	const index: Record<string, string[]> = {};
	for (const w of works) {
		for (const parentId of w.parent_slugs ?? []) {
			const list = index[parentId] ?? [];
			list.push(w.id);
			index[parentId] = list;
		}
	}
	return index;
}

function collectionTypeOf(work: Work, fortsetzung: Record<string, Chain>): CollectionType {
	const chain = fortsetzung[work.id];
	const hasChain = !!chain && (chain.predecessors.length > 0 || chain.successors.length > 0);
	const hasParent = (work.parent_slugs?.length ?? 0) > 0;
	if (hasParent && hasChain) return 'zyklus';
	if (hasParent) return 'band';
	if (hasChain) return 'reihe';
	return 'standalone';
}

// Transitive closure of the child index, so rollUpStats never walks the graph
// at request time.
function computeDescendants(
	works: Work[],
	children: Record<string, string[]>,
): Record<string, string[]> {
	const descendants: Record<string, string[]> = {};
	for (const w of works) {
		const out: string[] = [];
		const seen = new Set([w.id]);
		const queue = [w.id];
		while (queue.length > 0) {
			for (const childId of children[queue.shift() as string] ?? []) {
				if (seen.has(childId)) continue;
				seen.add(childId);
				out.push(childId);
				queue.push(childId);
			}
		}
		if (out.length > 0) descendants[w.id] = out;
	}
	return descendants;
}

/**
 * Emits the derived work/author graph as two virtual modules so that sorting,
 * similarity scoring and index building happen once at build time instead of
 * once per Worker isolate.
 *
 * `virtual:werk-plots` is kept separate because `plot` is ~46% of the work
 * payload but is only read by the work detail page and search.
 */
export function werkData({ root = 'data' } = {}): Plugin {
	let dataDir: string;
	let cache: { data: string; plots: string } | undefined;

	const build = () => {
		const works = readJsonDir<Work>(join(dataDir, 'works'))
			.map((e) => e.data)
			.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title, 'de'));
		const authors = readJsonDir<Author>(join(dataDir, 'authors'))
			.map((e) => e.data)
			.sort((a, b) => a.name.localeCompare(b.name, 'de'));
		const genres = JSON.parse(readFileSync(join(dataDir, 'genres.json'), 'utf8')) as Genre[];
		const links = Object.fromEntries(
			readJsonDir<ExternalLink[]>(join(dataDir, 'links')).map((e) => [e.name, e.data]),
		);

		const fortsetzung = computeFortsetzung(works);
		const children = computeChildren(works);

		const plots: Record<string, string> = {};
		const meta: WorkMeta[] = works.map(({ plot, ...rest }) => {
			if (plot) plots[rest.id] = plot;
			return rest;
		});

		const collectionTypes: Record<string, CollectionType> = {};
		for (const w of works) {
			const type = collectionTypeOf(w, fortsetzung);
			if (type !== 'standalone') collectionTypes[w.id] = type;
		}

		// Position indices let the server resolve a slug/id to an array offset
		// without building any Map at request time.
		const workIndex: Record<string, number> = {};
		works.forEach((w, i) => {
			workIndex[w.id] = i;
			if (w.slug !== w.id) workIndex[w.slug] = i;
		});
		const authorIndex: Record<string, number> = {};
		authors.forEach((a, i) => {
			authorIndex[a.id] = i;
			if (a.slug !== a.id) authorIndex[a.slug] = i;
		});
		const genreIndex: Record<string, number> = {};
		genres.forEach((g, i) => {
			genreIndex[g.id] = i;
			if (g.slug !== g.id) genreIndex[g.slug] = i;
		});

		const worksByAuthor: Record<string, number[]> = {};
		const worksByGenre: Record<string, number[]> = {};
		works.forEach((w, i) => {
			const forAuthor = worksByAuthor[w.author_id] ?? [];
			forAuthor.push(i);
			worksByAuthor[w.author_id] = forAuthor;
			for (const g of w.genre_ids) {
				const forGenre = worksByGenre[g] ?? [];
				forGenre.push(i);
				worksByGenre[g] = forGenre;
			}
		});

		// A single JSON.parse of one string beats thousands of object literals for
		// the parser to chew through on every isolate start.
		const json = (v: unknown) => `JSON.parse(${JSON.stringify(JSON.stringify(v))})`;

		return {
			data: [
				`export const works = ${json(meta)};`,
				`export const authors = ${json(authors)};`,
				`export const genres = ${json(genres)};`,
				`export const links = ${json(links)};`,
				`export const similar = ${json(computeSimilar(works))};`,
				`export const fortsetzung = ${json(fortsetzung)};`,
				`export const children = ${json(children)};`,
				`export const descendants = ${json(computeDescendants(works, children))};`,
				`export const collectionTypes = ${json(collectionTypes)};`,
				`export const workIndex = ${json(workIndex)};`,
				`export const authorIndex = ${json(authorIndex)};`,
				`export const genreIndex = ${json(genreIndex)};`,
				`export const worksByAuthor = ${json(worksByAuthor)};`,
				`export const worksByGenre = ${json(worksByGenre)};`,
			].join('\n'),
			plots: `export const plots = ${json(plots)};`,
		};
	};

	return {
		name: 'werk-data',
		configResolved(config) {
			dataDir = resolve(config.root, root);
		},
		resolveId(id) {
			if (id === DATA_ID || id === PLOTS_ID) return `\0${id}`;
		},
		load(id) {
			if (id !== `\0${DATA_ID}` && id !== `\0${PLOTS_ID}`) return;
			cache ??= build();
			return id === `\0${DATA_ID}` ? cache.data : cache.plots;
		},
		handleHotUpdate({ file, server }) {
			if (!file.startsWith(dataDir)) return;
			cache = undefined;
			for (const id of [DATA_ID, PLOTS_ID]) {
				const mod = server.moduleGraph.getModuleById(`\0${id}`);
				if (mod) server.moduleGraph.invalidateModule(mod);
			}
			server.ws.send({ type: 'full-reload' });
		},
	};
}
