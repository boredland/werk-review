import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { authorSuggestions, bookmarks, reads, reviews, users } from '$lib/db/schema';
import { destroySession, hashPassword, SESSION_COOKIE, verifyPassword } from '$lib/server/auth';
import { getWork } from '$lib/server/data';
import { getDb } from '$lib/server/db';
import { sendVerificationEmail } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(302, '/login');

	let userReviews: {
		id: string;
		rating: number;
		ratingLabel: string;
		title: string | null;
		body: string | null;
		version: string | null;
		createdAt: string;
		workTitle: string;
		workSlug: string;
	}[] = [];

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const rows = await db
				.select()
				.from(reviews)
				.where(eq(reviews.userId, locals.user.id))
				.orderBy(desc(reviews.createdAt));

			userReviews = rows
				.map((r) => {
					const work = getWork(r.workId);
					if (!work) return null;
					return {
						id: r.id,
						rating: r.rating,
						ratingLabel: r.ratingLabel,
						title: r.title,
						body: r.body,
						version: r.version,
						createdAt: r.createdAt,
						workTitle: work.title,
						workSlug: work.slug,
					};
				})
				.filter((r): r is NonNullable<typeof r> => r !== null);
		} catch {
			// D1 tables may not exist yet in local dev
		}
	}

	let userBookmarks: { workTitle: string; workSlug: string; createdAt: string }[] = [];

	let userReads: { workTitle: string; workSlug: string; createdAt: string }[] = [];

	if (platform?.env.DB) {
		try {
			const db = getDb(platform.env.DB);
			const bmRows = await db
				.select()
				.from(bookmarks)
				.where(eq(bookmarks.userId, locals.user.id))
				.orderBy(desc(bookmarks.createdAt));

			userBookmarks = bmRows
				.map((b) => {
					const work = getWork(b.workId);
					if (!work) return null;
					return { workTitle: work.title, workSlug: work.slug, createdAt: b.createdAt };
				})
				.filter((b): b is NonNullable<typeof b> => b !== null);

			const readRows = await db
				.select()
				.from(reads)
				.where(eq(reads.userId, locals.user.id))
				.orderBy(desc(reads.createdAt));

			userReads = readRows
				.map((r) => {
					const work = getWork(r.workId);
					if (!work) return null;
					return { workTitle: work.title, workSlug: work.slug, createdAt: r.createdAt };
				})
				.filter((r): r is NonNullable<typeof r> => r !== null);
		} catch {}
	}

	// This page is `private, no-store`, so the account details are safe to render
	// server-side. The root layout no longer exposes the session globally.
	return { user: locals.user, userReviews, userBookmarks, userReads };
};

export const actions: Actions = {
	resendVerification: async ({ locals, platform, url }) => {
		if (!locals.user) redirect(302, '/login');
		if (locals.user.emailVerified) return fail(400, { error: 'E-Mail bereits bestätigt.' });
		if (!platform?.env.DB || !platform?.env.EMAIL) {
			return fail(500, { error: 'E-Mail-Versand nicht verfügbar.' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.id, locals.user.id)).get();
		if (!user) return fail(404, { error: 'Benutzer nicht gefunden.' });

		let { verifyToken } = user;
		if (!verifyToken) {
			verifyToken = crypto.randomUUID();
			await db.update(users).set({ verifyToken }).where(eq(users.id, user.id));
		}

		const siteUrl = platform.env.PUBLIC_SITE_URL || url.origin;
		platform.context.waitUntil(
			sendVerificationEmail(platform.env.EMAIL, user.email, user.username, verifyToken, siteUrl),
		);

		return { resent: true };
	},

	updateUsername: async ({ locals, platform, request, cookies }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Dienst nicht verfügbar.' });
		}

		const formData = await request.formData();
		const username = (formData.get('username') as string)?.trim();
		if (!username || username.length < 3 || username.length > 30) {
			return fail(400, { error: 'Benutzername muss zwischen 3 und 30 Zeichen lang sein.' });
		}
		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			return fail(400, { error: 'Benutzername darf nur Buchstaben, Zahlen, _ und - enthalten.' });
		}
		if (username === locals.user.username) {
			return fail(400, { error: 'Das ist bereits dein Benutzername.' });
		}

		const db = getDb(platform.env.DB);
		const existing = await db.select().from(users).where(eq(users.username, username)).get();
		if (existing) {
			return fail(400, { error: 'Dieser Benutzername ist bereits vergeben.' });
		}

		await db.update(users).set({ username }).where(eq(users.id, locals.user.id));

		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			const sessionUser = { ...locals.user, username };
			await platform.env.SESSION_KV.put(`session:${token}`, JSON.stringify(sessionUser), {
				expirationTtl: 60 * 60 * 24 * 30,
			});
		}

		return { usernameUpdated: true };
	},

	updateEmail: async ({ locals, platform, request, cookies, url }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Dienst nicht verfügbar.' });
		}

		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
			return fail(400, { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}
		if (email === locals.user.email) {
			return fail(400, { error: 'Das ist bereits deine E-Mail-Adresse.' });
		}

		const db = getDb(platform.env.DB);
		const existing = await db.select().from(users).where(eq(users.email, email)).get();
		if (existing) {
			return fail(400, { error: 'Diese E-Mail-Adresse wird bereits verwendet.' });
		}

		const verifyToken = crypto.randomUUID();
		await db
			.update(users)
			.set({ email, emailVerified: false, verifyToken })
			.where(eq(users.id, locals.user.id));

		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			const sessionUser = { ...locals.user, email, emailVerified: false };
			await platform.env.SESSION_KV.put(`session:${token}`, JSON.stringify(sessionUser), {
				expirationTtl: 60 * 60 * 24 * 30,
			});
		}

		if (platform.env.EMAIL) {
			const user = await db.select().from(users).where(eq(users.id, locals.user.id)).get();
			if (user) {
				const siteUrl = platform.env.PUBLIC_SITE_URL || url.origin;
				platform.context.waitUntil(
					sendVerificationEmail(platform.env.EMAIL, email, user.username, verifyToken, siteUrl),
				);
			}
		}

		return { emailUpdated: true };
	},

	updatePassword: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB) {
			return fail(500, { error: 'Dienst nicht verfügbar.' });
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'Bitte fülle alle Felder aus.' });
		}
		if (newPassword.length < 8) {
			return fail(400, { error: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.' });
		}
		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'Die Passwörter stimmen nicht überein.' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.id, locals.user.id)).get();
		if (!user?.passwordHash) {
			return fail(400, { error: 'Passwort konnte nicht geändert werden.' });
		}

		const valid = await verifyPassword(currentPassword, user.passwordHash);
		if (!valid) {
			return fail(400, { error: 'Das aktuelle Passwort ist falsch.' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db.update(users).set({ passwordHash }).where(eq(users.id, locals.user.id));

		return { passwordUpdated: true };
	},

	deleteReview: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB) {
			return fail(500, { error: 'Dienst nicht verfügbar.' });
		}

		const formData = await request.formData();
		const reviewId = formData.get('reviewId') as string;
		if (!reviewId) return fail(400, { error: 'Bewertung nicht gefunden.' });

		const db = getDb(platform.env.DB);
		await db
			.delete(reviews)
			.where(and(eq(reviews.id, reviewId), eq(reviews.userId, locals.user.id)));

		return { reviewDeleted: true };
	},

	deleteAccount: async ({ locals, platform, request, cookies }) => {
		if (!locals.user) redirect(302, '/login');
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Dienst nicht verfügbar.' });
		}

		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmation = formData.get('confirmation') as string;

		if (confirmation !== locals.user.username) {
			return fail(400, { deleteError: 'Bitte gib deinen Benutzernamen korrekt ein.' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.id, locals.user.id)).get();
		if (!user?.passwordHash) {
			return fail(400, { deleteError: 'Konto konnte nicht gelöscht werden.' });
		}

		if (!password || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { deleteError: 'Das Passwort ist falsch.' });
		}

		await db.delete(reviews).where(eq(reviews.userId, locals.user.id));
		await db.delete(bookmarks).where(eq(bookmarks.userId, locals.user.id));
		await db.delete(reads).where(eq(reads.userId, locals.user.id));
		await db.delete(authorSuggestions).where(eq(authorSuggestions.userId, locals.user.id));
		await db.delete(users).where(eq(users.id, locals.user.id));

		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			await destroySession(platform.env.SESSION_KV, token);
			cookies.delete(SESSION_COOKIE, { path: '/' });
		}

		redirect(302, '/');
	},
};
