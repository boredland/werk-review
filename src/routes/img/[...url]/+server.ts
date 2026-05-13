import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const imageUrl = params.url;
	if (!imageUrl) error(400, 'URL required');

	// Add protocol if missing
	const targetUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;

	const width = url.searchParams.get('w');

	try {
		let finalUrl = targetUrl;
		if (width) {
			finalUrl = `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}&w=${width}&output=webp&q=80`;
		}

		const response = await fetch(finalUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
			},
		});

		if (!response.ok) {
			// Fallback to original URL if wsrv fails
			if (finalUrl !== targetUrl) {
				const fallback = await fetch(targetUrl, {
					headers: {
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
					},
				});
				return new Response(fallback.body, {
					headers: {
						'content-type': fallback.headers.get('content-type') || 'image/jpeg',
						'cache-control': 'public, max-age=31536000, immutable',
					},
				});
			}
			const status = response.status >= 400 && response.status < 600 ? response.status : 502;
			// biome-ignore lint/suspicious/noExplicitAny: SvelteKit error expects specific status codes which we've validated
			error(status as any, `Failed to fetch image: ${response.statusText}`);
		}

		const contentType = response.headers.get('content-type');
		const headers = new Headers();
		if (contentType) headers.set('content-type', contentType);
		headers.set('cache-control', 'public, max-age=31536000, immutable');
		headers.set('access-control-allow-origin', '*');

		return new Response(response.body, { headers });
	} catch (err) {
		console.error('Proxy error:', err);
		error(502, 'Failed to proxy image');
	}
};
