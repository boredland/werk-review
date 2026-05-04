import type { Handle } from '@sveltejs/kit';
import { getSession, SESSION_COOKIE } from '$lib/server/auth';

const NO_CACHE_ROUTES = ['/login', '/registrieren', '/konto', '/admin', '/logout'];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token && event.platform?.env.SESSION_KV) {
		const user = await getSession(event.platform.env.SESSION_KV, token);
		if (user) {
			event.locals.user = {
				id: user.id,
				username: user.username,
				email: user.email,
				emailVerified: user.emailVerified ?? false,
			};
		}
	}

	const response = await resolve(event);

	const path = event.url.pathname;
	if (!response.headers.has('cache-control') && event.request.method === 'GET') {
		if (NO_CACHE_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
			response.headers.set('cache-control', 'private, no-cache');
		} else if (event.locals.user) {
			response.headers.set('cache-control', 'private, no-store');
		} else if (path === '/ueber-uns') {
			response.headers.set('cache-control', 'public, max-age=3600, s-maxage=86400');
		} else {
			response.headers.set(
				'cache-control',
				'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
			);
		}
	}

	return response;
};
