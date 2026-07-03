import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const OUT_DIR = join(import.meta.dirname, 'example-sheets');

function escapeCsv(val) {
	if (val === null || val === undefined) return '';
	const str = String(val);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function toCsv(headers, rows) {
	const lines = [headers.map(escapeCsv).join(',')];
	for (const row of rows) {
		lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
	}
	return `${lines.join('\n')}\n`;
}

function sourcesToString(sources) {
	if (!sources || sources.length === 0) return '';
	return sources.map((s) => `${s.label} <${s.url}>`).join('|');
}

function readJsonDir(subdir) {
	return readdirSync(join(DATA_DIR, subdir))
		.filter((f) => f.endsWith('.json'))
		.map((f) => ({ file: f, data: JSON.parse(readFileSync(join(DATA_DIR, subdir, f), 'utf-8')) }));
}

mkdirSync(OUT_DIR, { recursive: true });

// Authors
const authors = readJsonDir('authors').map((e) => e.data);

const authorRows = authors.map((a) => ({
	id: a.id,
	name: a.name,
	slug: a.slug,
	aliases: (a.aliases || []).join('|'),
	born: a.born,
	died: a.died,
	bio: a.bio,
	source_note: a.source_note ?? '',
}));

writeFileSync(
	join(OUT_DIR, 'Autoren.csv'),
	toCsv(['id', 'name', 'slug', 'aliases', 'born', 'died', 'bio', 'source_note'], authorRows),
);

// Works
const works = readJsonDir('works').map((e) => e.data);

const workRows = works
	.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
	.map((w) => ({
		id: w.id,
		author_id: w.author_id,
		genre_ids: (w.genre_ids || []).join('|'),
		title: w.title,
		slug: w.slug,
		aliases: (w.aliases || []).join('|'),
		year_display: w.year_display,
		parent_slugs: (w.parent_slugs || []).join('|'),
		fortsetzung_von_ids: (w.fortsetzung_von_ids || []).join('|'),
		plot: w.plot,
		source_note: w.source_note ?? '',
		sources: sourcesToString(w.sources),
	}));

writeFileSync(
	join(OUT_DIR, 'Werke.csv'),
	toCsv(
		[
			'id',
			'author_id',
			'genre_ids',
			'title',
			'slug',
			'aliases',
			'year_display',
			'parent_slugs',
			'fortsetzung_von_ids',
			'plot',
			'source_note',
			'sources',
		],
		workRows,
	),
);

// Genres
const genres = JSON.parse(readFileSync(join(DATA_DIR, 'genres.json'), 'utf-8'));
const genreRows = genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug }));

writeFileSync(join(OUT_DIR, 'Genres.csv'), toCsv(['id', 'name', 'slug'], genreRows));

// Links (enriched external links, one row per link; work_slug is the filename)
const linkRows = readJsonDir('links').flatMap(({ file, data }) => {
	const workSlug = file.slice(0, -5);
	return (Array.isArray(data) ? data : []).map((l) => ({
		work_slug: workSlug,
		source: l.source,
		format: l.format,
		url: l.url,
		label: l.label,
	}));
});

writeFileSync(
	join(OUT_DIR, 'Links.csv'),
	toCsv(['work_slug', 'source', 'format', 'url', 'label'], linkRows),
);

console.log('Exported CSVs to scripts/example-sheets/');
console.log(`  Autoren.csv: ${authorRows.length} rows`);
console.log(`  Werke.csv: ${workRows.length} rows`);
console.log(`  Genres.csv: ${genreRows.length} rows`);
console.log(`  Links.csv: ${linkRows.length} rows`);
