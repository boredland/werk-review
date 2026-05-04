import { desc, eq } from 'drizzle-orm';
import { reviews, users } from '$lib/db/schema';
import { getWork } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

const SITE = 'https://werk.review';

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const GET: RequestHandler = async ({ platform }) => {
	let items = '';

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const rows = await db
				.select({
					id: reviews.id,
					workId: reviews.workId,
					rating: reviews.rating,
					ratingLabel: reviews.ratingLabel,
					title: reviews.title,
					body: reviews.body,
					createdAt: reviews.createdAt,
					username: users.username,
				})
				.from(reviews)
				.innerJoin(users, eq(reviews.userId, users.id))
				.orderBy(desc(reviews.createdAt))
				.limit(30);

			for (const row of rows) {
				const work = getWork(row.workId);
				if (!work) continue;

				const link = `${SITE}/werke/${work.slug}`;
				const itemTitle = row.title
					? `${escapeXml(row.title)} – ${escapeXml(work.title)}`
					: `${escapeXml(row.ratingLabel)} – ${escapeXml(work.title)}`;

				let description = `<p>Bewertung von <strong>${escapeXml(row.username)}</strong>: ${escapeXml(row.ratingLabel)}</p>`;
				if (row.body) {
					description += `<p>${escapeXml(row.body)}</p>`;
				}

				const pubDate = new Date(row.createdAt).toUTCString();

				items += `
    <item>
      <title>${itemTitle}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${row.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
			}
		} catch {
			// D1 not available
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>werk.review – Neue Bewertungen</title>
    <link>${SITE}</link>
    <description>Aktuelle Bewertungen klassischer deutschsprachiger Literatur</description>
    <language>de</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8',
			'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
		},
	});
};
