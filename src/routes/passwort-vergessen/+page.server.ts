import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { getDb } from '$lib/server/db';
import { sendPasswordResetEmail } from '$lib/server/email';
import { AUTH_LIMITS, checkRateLimit } from '$lib/server/rate-limit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, platform, url, getClientAddress }) => {
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Datenbank nicht verfügbar.', email: '' });
		}

		const ip = getClientAddress();
		const rl = await checkRateLimit(platform.env.SESSION_KV, ip, AUTH_LIMITS.passwordReset);
		if (!rl.allowed) {
			return { sent: true };
		}

		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();

		if (!email) {
			return fail(400, { error: 'Bitte gib deine E-Mail-Adresse ein.', email: '' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.email, email)).get();

		// Always show success to prevent email enumeration
		if (!user) {
			return { sent: true };
		}

		const resetToken = crypto.randomUUID();
		const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

		await db
			.update(users)
			.set({ resetToken, resetTokenExpiry: expiry })
			.where(eq(users.id, user.id));

		if (platform.env.EMAIL) {
			const siteUrl = platform.env.PUBLIC_SITE_URL || url.origin;
			platform.context.waitUntil(
				sendPasswordResetEmail(platform.env.EMAIL, email, user.username, resetToken, siteUrl),
			);
		}

		return { sent: true };
	},
};
