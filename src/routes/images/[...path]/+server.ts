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

	return new Response(object.body as ReadableStream, { headers });
};
