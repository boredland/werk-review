const FROM = 'werk.review <noreply@werk.review>';

export async function sendVerificationEmail(
	email: SendEmail,
	to: string,
	username: string,
	verifyToken: string,
	siteUrl: string,
) {
	const verifyUrl = `${siteUrl}/verifizieren/${verifyToken}`;

	await email.send({
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
