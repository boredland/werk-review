import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const OUT_DIR = join(import.meta.dirname, 'example-sheets');

function escapeCsv(val) {
	if (val === null || val === undefined) return '';
	const str = String(val);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

function toCsv(headers, rows) {
	const lines = [headers.map(escapeCsv).join(',')];
	for (const row of rows) {
		lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
	}
	return lines.join('\n') + '\n';
}

function sourcesToString(sources) {
	if (!sources || sources.length === 0) return '';
	return sources.map((s) => `${s.label} <${s.url}>`).join('|');
}

// Authors
const authorFiles = readdirSync(join(DATA_DIR, 'authors')).filter((f) => f.endsWith('.json'));
const authors = authorFiles.map((f) => JSON.parse(readFileSync(join(DATA_DIR, 'authors', f), 'utf-8')));

const authorRows = authors.map((a) => ({
	id: a.id,
	name: a.name,
	slug: a.slug,
	aliases: (a.aliases || []).join('|'),
	born: a.born,
	died: a.died,
	gnd_id: a.gnd_id,
	bio: a.bio,
	photo_r2_key: a.photo_r2_key,
	sources: sourcesToString(a.sources)
}));

writeFileSync(
	join(OUT_DIR, 'Autoren.csv'),
	toCsv(['id', 'name', 'slug', 'aliases', 'born', 'died', 'gnd_id', 'bio', 'photo_r2_key', 'sources'], authorRows)
);

// Works
const workFiles = readdirSync(join(DATA_DIR, 'works')).filter((f) => f.endsWith('.json'));
const works = workFiles.map((f) => JSON.parse(readFileSync(join(DATA_DIR, 'works', f), 'utf-8')));

const workRows = works
	.sort((a, b) => (a.year_from ?? 9999) - (b.year_from ?? 9999))
	.map((w) => ({
		id: w.id,
		author_id: w.author_id,
		genre_id: w.genre_id,
		title: w.title,
		slug: w.slug,
		aliases: (w.aliases || []).join('|'),
		year_from: w.year_from,
		year_to: w.year_to,
		year_display: w.year_display,
		collection_title: w.collection_title,
		collection_aliases: (w.collection_aliases || []).join('|'),
		gnd_id: w.gnd_id,
		plot: w.plot,
		sources: sourcesToString(w.sources)
	}));

writeFileSync(
	join(OUT_DIR, 'Werke.csv'),
	toCsv(['id', 'author_id', 'genre_id', 'title', 'slug', 'aliases', 'year_from', 'year_to', 'year_display', 'collection_title', 'collection_aliases', 'gnd_id', 'plot', 'sources'], workRows)
);

// Genres
const genres = JSON.parse(readFileSync(join(DATA_DIR, 'genres.json'), 'utf-8'));
const genreRows = genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug }));

writeFileSync(join(OUT_DIR, 'Genres.csv'), toCsv(['id', 'name', 'slug'], genreRows));

// Links (example data since none exist yet)
const linkRows = [
	{ work_id: 'der-gruene-heinrich-erste-fassung', source: 'Project Gutenberg', format: 'HTML', url: 'https://www.gutenberg.org/ebooks/12285', label: 'Der grüne Heinrich (Gutenberg)' },
	{ work_id: 'kleider-machen-leute', source: 'Zeno.org', format: 'HTML', url: 'http://www.zeno.org/Literatur/M/Keller,+Gottfried/Erz%C3%A4hlung/Kleider+machen+Leute', label: 'Kleider machen Leute (Zeno)' },
	{ work_id: 'romeo-und-julia-auf-dem-dorfe', source: 'Project Gutenberg', format: 'HTML', url: 'https://www.gutenberg.org/ebooks/24042', label: 'Romeo und Julia auf dem Dorfe (Gutenberg)' }
];

writeFileSync(join(OUT_DIR, 'Links.csv'), toCsv(['work_id', 'source', 'format', 'url', 'label'], linkRows));

console.log('Exported CSVs to scripts/example-sheets/');
console.log(`  Autoren.csv: ${authorRows.length} rows`);
console.log(`  Werke.csv: ${workRows.length} rows`);
console.log(`  Genres.csv: ${genreRows.length} rows`);
console.log(`  Links.csv: ${linkRows.length} rows (example data)`);
