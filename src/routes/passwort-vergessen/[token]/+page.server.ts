import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { createSession, hashPassword, SESSION_COOKIE } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { AUTH_LIMITS, checkRateLimit } from '$lib/server/rate-limit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'Datenbank nicht verfügbar');

	const db = getDb(platform.env.DB);
	const user = await db.select().from(users).where(eq(users.resetToken, params.token)).get();

	if (!user?.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
		error(404, 'Ungültiger oder abgelaufener Link');
	}

	return { token: params.token };
};

export const actions: Actions = {
	default: async ({ request, params, platform, cookies, getClientAddress }) => {
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Datenbank nicht verfügbar.' });
		}

		const ip = getClientAddress();
		const rl = await checkRateLimit(platform.env.SESSION_KV, ip, AUTH_LIMITS.resetToken);
		if (!rl.allowed) {
			return fail(429, {
				error: `Zu viele Versuche. Bitte warte ${Math.ceil(rl.retryAfter / 60)} Minuten.`,
			});
		}

		const data = await request.formData();
		const password = data.get('password') as string;
		const passwordConfirm = data.get('password_confirm') as string;

		if (!password || password.length < 8) {
			return fail(400, { error: 'Passwort muss mindestens 8 Zeichen lang sein.' });
		}

		if (password !== passwordConfirm) {
			return fail(400, { error: 'Passwörter stimmen nicht überein.' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.resetToken, params.token)).get();

		if (!user?.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
			return fail(400, { error: 'Link ist abgelaufen. Bitte fordere einen neuen an.' });
		}

		const passwordHash = await hashPassword(password);
		await db
			.update(users)
			.set({ passwordHash, resetToken: null, resetTokenExpiry: null })
			.where(eq(users.id, user.id));

		const sessionToken = await createSession(platform.env.SESSION_KV, {
			id: user.id,
			username: user.username,
			email: user.email,
			emailVerified: user.emailVerified,
		});
		cookies.set(SESSION_COOKIE, sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30,
		});

		redirect(303, '/konto');
	},
};
