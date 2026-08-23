declare module 'virtual:werk-data' {
	import type { Author, CollectionType, ExternalLink, Genre, WorkMeta } from '$lib/types';

	export const works: WorkMeta[];
	export const authors: Author[];
	export const genres: Genre[];
	export const links: Record<string, ExternalLink[]>;
	export const similar: Record<string, number[]>;
	export const fortsetzung: Record<string, { predecessors: string[]; successors: string[] }>;
	export const children: Record<string, string[]>;
	export const descendants: Record<string, string[]>;
	export const collectionTypes: Record<string, Exclude<CollectionType, 'standalone'>>;
	export const workIndex: Record<string, number>;
	export const authorIndex: Record<string, number>;
	export const genreIndex: Record<string, number>;
	export const worksByAuthor: Record<string, number[]>;
	export const worksByGenre: Record<string, number[]>;
}

declare module 'virtual:werk-plots' {
	export const plots: Record<string, string>;
}
