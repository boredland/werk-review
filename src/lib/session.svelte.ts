import { browser } from '$app/environment';

export type SessionUser = { username: string };

/**
 * Session state fetched in the browser rather than rendered into the page.
 *
 * Page HTML previously embedded the signed-in username, which made every
 * response user-specific. Cloudflare ignores `Vary` by default, so a response
 * cached for one visitor could be served to another. Keeping the session out of
 * the HTML lets pages be cached at the edge and shared safely.
 */
class Session {
	user = $state<SessionUser | null>(null);
	isAdmin = $state(false);
	loaded = $state(false);

	async load() {
		if (!browser) return;
		try {
			const res = await fetch('/api/me');
			if (!res.ok) throw new Error(`${res.status}`);
			const data = (await res.json()) as { user: SessionUser | null; isAdmin: boolean };
			this.user = data.user;
			this.isAdmin = data.isAdmin;
		} catch {
			this.user = null;
			this.isAdmin = false;
		} finally {
			this.loaded = true;
		}
	}
}

export const session = new Session();
