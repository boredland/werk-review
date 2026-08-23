import type { Handle } from '@sveltejs/kit';
import { getSession, SESSION_COOKIE } from '$lib/server/auth';

// Routes whose HTML depends on the signed-in user and must never be cached.
// Everything else renders identically for every visitor: the session lives in
// the browser and is fetched from /api/me.
const NO_CACHE_ROUTES = [
	'/login',
	'/registrieren',
	'/konto',
	'/admin',
	'/logout',
	'/verifizieren',
	'/vorschlaege',
	'/api',
];

// Vulnerability scanners account for the majority of inbound requests. They only
// ever probe extensions and prefixes this app never serves, so answering them
// before SvelteKit routes the request avoids rendering the error page.
const SCANNER_EXTENSIONS = /\.(?:php\d?|aspx?|jsp|cgi|pl|sh|env|ini|bak|sql|old|swp|zip|tar|gz)$/i;
const SCANNER_PREFIXES = [
	'/wp-',
	'/wordpress/',
	'/vendor/',
	'/autoload_classmap',
	'/administrator/',
	'/phpmyadmin',
	'/phpunit',
	'/cgi-bin/',
	'/.git',
	'/.env',
	'/.aws',
	'/.vscode',
	'/.well-known/index.php',
];

// Page HTML is identical for every visitor: the session is fetched in the
// browser from /api/me, so nothing user-specific is rendered. That makes these
// responses safe to cache at the edge and share across visitors, which matters
// because Cloudflare ignores `Vary` by default.
//
// Content only changes when the hourly Sheets sync redeploys or a review is
// posted, so an hour at the edge is acceptable; `max-age=0` keeps browsers
// revalidating so a new deploy is picked up immediately.
//
// stale-while-revalidate is intentionally omitted wherever `s-maxage` is set:
// `s-maxage` implies proxy-revalidate, which disables it, so pairing the two
// does nothing.
const PUBLIC_CACHE = 'public, max-age=0, s-maxage=3600';
const STATIC_CACHE = 'public, max-age=3600, s-maxage=86400';

function isScannerPath(path: string): boolean {
	if (SCANNER_EXTENSIONS.test(path)) return true;
	const lower = path.toLowerCase();
	return SCANNER_PREFIXES.some((p) => lower.startsWith(p));
}

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === 'www.werk.review') {
		const target = new URL(event.url.href);
		target.hostname = 'werk.review';
		return new Response(null, {
			status: 308,
			headers: { location: target.href },
		});
	}

	if (isScannerPath(event.url.pathname)) {
		return new Response('Not Found', {
			status: 404,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': STATIC_CACHE,
			},
		});
	}

	event.locals.user = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token && event.platform?.env.SESSION_KV) {
		const user = await getSession(event.platform.env.SESSION_KV, token);
		if (user) {
			const banned = await event.platform.env.SESSION_KV.get(`banned:${user.id}`);
			if (banned) {
				await event.platform.env.SESSION_KV.delete(`session:${token}`);
				event.cookies.delete(SESSION_COOKIE, { path: '/' });
			} else {
				event.locals.user = {
					id: user.id,
					username: user.username,
					email: user.email,
					emailVerified: user.emailVerified ?? false,
				};
			}
		}
	}

	const response = await resolve(event);

	response.headers.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'permissions-policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()',
	);
	response.headers.set('cross-origin-opener-policy', 'same-origin');

	const path = event.url.pathname;
	if (!response.headers.has('cache-control') && event.request.method === 'GET') {
		if (NO_CACHE_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
			response.headers.set('cache-control', 'private, no-cache');
		} else if (path === '/ueber-uns') {
			response.headers.set('cache-control', STATIC_CACHE);
		} else {
			response.headers.set('cache-control', PUBLIC_CACHE);
		}
	}

	return response;
};
