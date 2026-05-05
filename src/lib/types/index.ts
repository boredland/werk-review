export interface Author {
	id: string;
	name: string;
	slug: string;
	aliases: string[];
	born: number | null;
	died: number | null;
	gnd_id: string | null;
	bio: string;
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
	parent_id: string | null;
	collection_title: string | null;
	collection_aliases: string[];
	gnd_id: string | null;
	plot: string | null;
	plot_source: { label: string; url: string } | null;
	plot_fetched_at: string | null;
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
	librivox_id?: string;
	formats?: string[];
}

export interface SimilarWork {
	work_id: string;
	score: number;
}
