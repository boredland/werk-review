const FROM = 'werk.review <noreply@werk.review>';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sendWithRetry(email: SendEmail, message: Parameters<SendEmail['send']>[0]) {
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			await email.send(message);
			return;
		} catch (err) {
			if (attempt === MAX_RETRIES) {
				console.error(`Email send failed after ${MAX_RETRIES + 1} attempts:`, err);
				return;
			}
			await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
		}
	}
}

export async function sendVerificationEmail(
	email: SendEmail,
	to: string,
	username: string,
	verifyToken: string,
	siteUrl: string,
) {
	const verifyUrl = `${siteUrl}/verifizieren/${verifyToken}`;

	await sendWithRetry(email, {
		from: FROM,
		to,
		subject: 'Bestätige deine E-Mail-Adresse – werk.review',
		text: `Hallo ${username},

bitte bestätige deine E-Mail-Adresse, indem du folgenden Link öffnest:

${verifyUrl}

Falls du dich nicht bei werk.review registriert hast, kannst du diese E-Mail ignorieren.

– werk.review`,
		html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 2rem 1rem; color: #2c2420;">
	<p style="font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #b8963e;">werk.review</p>
	<h1 style="font-size: 1.5rem; margin: 0.5rem 0 1.5rem;">E-Mail bestätigen</h1>
	<p>Hallo ${username},</p>
	<p>bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
	<p style="margin: 1.5rem 0;">
		<a href="${verifyUrl}" style="display: inline-block; padding: 0.7rem 2rem; background: #7b2d3b; color: #fff; text-decoration: none; font-size: 0.9rem; font-weight: 600;">E-Mail bestätigen</a>
	</p>
	<p style="font-size: 0.85rem; color: #8a7f76;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
	<p style="font-size: 0.82rem; word-break: break-all; color: #7b2d3b;">${verifyUrl}</p>
	<hr style="border: none; border-top: 1px solid #e8e2d9; margin: 2rem 0;">
	<p style="font-size: 0.78rem; color: #8a7f76;">Falls du dich nicht bei werk.review registriert hast, kannst du diese E-Mail ignorieren.</p>
</body>
</html>`,
	});
}

export async function sendPasswordResetEmail(
	email: SendEmail,
	to: string,
	username: string,
	resetToken: string,
	siteUrl: string,
) {
	const resetUrl = `${siteUrl}/passwort-vergessen/${resetToken}`;

	await sendWithRetry(email, {
		from: FROM,
		to,
		subject: 'Passwort zurücksetzen – werk.review',
		text: `Hallo ${username},

du hast ein neues Passwort angefordert. Öffne folgenden Link, um dein Passwort zurückzusetzen:

${resetUrl}

Der Link ist 1 Stunde gültig. Falls du kein neues Passwort angefordert hast, ignoriere diese E-Mail.

– werk.review`,
		html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 2rem 1rem; color: #2c2420;">
	<p style="font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #b8963e;">werk.review</p>
	<h1 style="font-size: 1.5rem; margin: 0.5rem 0 1.5rem;">Passwort zurücksetzen</h1>
	<p>Hallo ${username},</p>
	<p>du hast ein neues Passwort angefordert. Klicke auf den folgenden Link:</p>
	<p style="margin: 1.5rem 0;">
		<a href="${resetUrl}" style="display: inline-block; padding: 0.7rem 2rem; background: #7b2d3b; color: #fff; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Passwort zurücksetzen</a>
	</p>
	<p style="font-size: 0.85rem; color: #8a7f76;">Der Link ist 1 Stunde gültig.</p>
	<p style="font-size: 0.85rem; color: #8a7f76;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
	<p style="font-size: 0.82rem; word-break: break-all; color: #7b2d3b;">${resetUrl}</p>
	<hr style="border: none; border-top: 1px solid #e8e2d9; margin: 2rem 0;">
	<p style="font-size: 0.78rem; color: #8a7f76;">Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.</p>
</body>
</html>`,
	});
}
