export interface Author {
	id: string;
	name: string;
	slug: string;
	aliases: string[];
	born: number | null;
	died: number | null;
	bio: string;
	sources: Source[];
}

export interface Work {
	id: string;
	author_id: string;
	genre_ids: string[];
	title: string;
	slug: string;
	aliases: string[];
	year: number | null;
	year_display: string;
	parent_slugs: string[];
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

export interface LibriVoxSection {
	id: string;
	section_number: string;
	title: string;
	listen_url: string;
	playtime: string;
	readers?: { display_name: string }[];
}

export interface LibriVoxBook {
	title: string;
	url_librivox: string;
	sections: LibriVoxSection[];
}

export interface LibriVoxData {
	books?: LibriVoxBook[];
}
