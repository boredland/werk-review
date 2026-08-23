import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/**
 * Current session for the header, which renders client-side so that page HTML
 * stays identical for every visitor and can be cached at the edge.
 */
export const GET: RequestHandler = ({ locals }) => {
	return json(
		{
			user: locals.user && { username: locals.user.username },
			isAdmin: isAdmin(locals.user),
		},
		{ headers: { 'cache-control': 'private, no-store' } },
	);
};
