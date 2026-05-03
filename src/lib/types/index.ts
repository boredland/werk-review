export interface Author {
	id: string;
	name: string;
	slug: string;
	aliases: string[];
	born: number | null;
	died: number | null;
	gnd_id: string | null;
	bio: string;
	photo_r2_key: string | null;
	sources: Source[];
}

export interface Work {
	id: string;
	author_id: string;
	genre_id: string;
	title: string;
	slug: string;
	aliases: string[];
	year_from: number | null;
	year_to: number | null;
	year_display: string;
	collection_title: string | null;
	collection_aliases: string[];
	gnd_id: string | null;
	plot: string | null;
	sources: Source[];
}

export interface Genre {
	id: string;
	name: string;
	slug: string;
}

export interface Source {
	label: string;
	url: string;
}

export interface ExternalLink {
	source: string;
	format: string;
	url: string;
	label: string;
}

export interface SimilarWork {
	work_id: string;
	score: number;
}
