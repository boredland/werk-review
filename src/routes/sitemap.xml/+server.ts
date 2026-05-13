import { getAuthors, getGenres, getWorks } from '$lib/server/data';
import type { RequestHandler } from './$types';

const SITE = 'https://werk.review';

function entry(path: string, lastmod?: string | null) {
	const loc = `<loc>${SITE}${path}</loc>`;
	const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
	return `<url>${loc}${mod}</url>`;
}

function isoDate(value: string | null | undefined): string | null {
	if (!value) return null;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 10);
}

export const GET: RequestHandler = () => {
	const authors = getAuthors();
	const works = getWorks();
	const genres = getGenres();

	const today = new Date().toISOString().slice(0, 10);

	const staticPages = [
		'/',
		'/autoren',
		'/werke',
		'/genre',
		'/ueber-uns',
		'/impressum',
		'/datenschutz',
	];

	const urls = [
		...staticPages.map((p) => entry(p, today)),
		...authors.map((a) => entry(`/autoren/${a.slug}`)),
		...works.map((w) => entry(`/werke/${w.slug}`, isoDate(w.plot_fetched_at))),
		...genres.map((g) => entry(`/genre/${g.slug}`)),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600, s-maxage=86400',
		},
	});
};
