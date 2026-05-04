import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	const bucket = platform?.env.IMAGES;
	if (!bucket) error(503, 'Image storage unavailable');

	const object = await bucket.get(params.path);
	if (!object) error(404, 'Image not found');

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('cache-control', 'public, max-age=31536000, immutable');
	headers.set('vary', 'Accept');

	if (!headers.has('content-type')) {
		const ext = params.path.split('.').pop();
		const types: Record<string, string> = {
			webp: 'image/webp',
			jpg: 'image/jpeg',
			png: 'image/png',
		};
		if (ext && types[ext]) headers.set('content-type', types[ext]);
	}

	return new Response(object.body as ReadableStream, { headers });
};
