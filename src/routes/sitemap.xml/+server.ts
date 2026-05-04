import { getAuthors, getGenres, getWorks } from '$lib/server/data';
import type { RequestHandler } from './$types';

const SITE = 'https://werk.review';

export const GET: RequestHandler = () => {
	const authors = getAuthors();
	const works = getWorks();
	const genres = getGenres();

	const staticPages = [
		{ path: '/', priority: '1.0', changefreq: 'weekly' },
		{ path: '/autoren', priority: '0.8', changefreq: 'weekly' },
		{ path: '/werke', priority: '0.8', changefreq: 'weekly' },
		{ path: '/genre', priority: '0.7', changefreq: 'monthly' },
		{ path: '/ueber-uns', priority: '0.3', changefreq: 'monthly' },
	];

	const urls = [
		...staticPages.map(
			(p) =>
				`<url><loc>${SITE}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
		),
		...authors.map(
			(a) =>
				`<url><loc>${SITE}/autoren/${a.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
		),
		...works.map(
			(w) =>
				`<url><loc>${SITE}/werke/${w.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
		),
		...genres.map(
			(g) =>
				`<url><loc>${SITE}/genre/${g.slug}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
		),
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
