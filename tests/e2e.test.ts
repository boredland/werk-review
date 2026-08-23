import { test, expect } from '@playwright/test';

test.describe('werk.review E2E', () => {
	test('homepage loads and shows hero', async ({ page, isMobile }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Klassische deutsche Literatur');
		if (!isMobile) {
			await expect(page.locator('nav')).toBeVisible();
		}
	});

	test('search for a work and navigate to it', async ({ page, isMobile }) => {
		if (isMobile) return;
		await page.goto('/');
		const searchInput = page.locator('#nav-search-input');
		await searchInput.fill('Sinngedicht');
		await searchInput.press('Enter');

		await expect(page).toHaveURL(/\/suche\?q=Sinngedicht/);
		await expect(page.locator('h2')).toContainText('Werke');
		
		const workLink = page.getByRole('link', { name: /Das Sinngedicht/i });
		await expect(workLink).toBeVisible();
		await workLink.click();

		await expect(page).toHaveURL(/\/werke\/das-sinngedicht/);
		await expect(page.locator('h1')).toContainText('Das Sinngedicht');
	});

	test('work page displays external links and formats', async ({ page }) => {
		// Using a known work with IA links
		await page.goto('/werke/die-drei-gerechten-kammacher');
		
		await expect(page.locator('h1')).toContainText('Die drei gerechten Kammacher');
		
		// Check for "Lesen & Hören" section
		await expect(page.locator('section.external-links')).toBeVisible();
		
		// Check for Internet Archive card
		const iaCard = page.locator('.link-card', { hasText: 'Internet Archive' });
		await expect(iaCard).toBeVisible();
		
		// Check for format tags (like EPUB or PDF)
		const formatTags = iaCard.locator('.format-tag');
		expect(await formatTags.count()).toBeGreaterThan(0);
	});

	test('author page loads correctly', async ({ page }) => {
		await page.goto('/autoren/gottfried-keller');
		await expect(page.locator('h1')).toContainText('Gottfried Keller');
		
		// Check if some works are listed
		const workItems = page.locator('.work-row');
		expect(await workItems.count()).toBeGreaterThan(0);
	});

	test('mobile menu functionality', async ({ page, isMobile }) => {
		if (!isMobile) return;

		await page.goto('/');
		const menuBtn = page.locator('.mobile-toggle');
		await expect(menuBtn).toBeVisible();
		
		await menuBtn.click();
		await expect(page.locator('nav.nav-open')).toBeVisible();
	});

	test('work page renders the plot, which loads from a separate chunk', async ({ page }) => {
		await page.goto('/werke/der-golem');
		await expect(page.locator('section.plot')).toContainText('Athanasius Pernath');
	});

	test('search matches on plot text, not just titles', async ({ page, isMobile }) => {
		if (isMobile) return;
		await page.goto('/suche?q=Gemmenschneider');
		await expect(page.getByRole('link', { name: /Der Golem/i }).first()).toBeVisible();
	});

	test('scanner probes are refused without rendering the app', async ({ page }) => {
		const res = await page.goto('/wp-admin/install.php');
		expect(res?.status()).toBe(404);
		// The app shell would pull in CSS and the layout; the early return must not.
		await expect(page.locator('header.header')).toHaveCount(0);
		expect(res?.headers()['cache-control']).toContain('max-age=3600');
	});

	test('real missing pages still render the app error page', async ({ page }) => {
		const res = await page.goto('/werke/dieses-werk-gibt-es-nicht');
		expect(res?.status()).toBe(404);
		await expect(page.locator('header.header')).toBeVisible();
	});

	// The server no longer prefetches LibriVox data, so the player has to fetch it
	// itself on mount.
	test('LibriVox player loads its audiobook client-side', async ({ page }) => {
		let apiCalls = 0;
		await page.route('**/api/librivox/*', (route) => {
			apiCalls++;
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					books: [
						{
							title: 'Abner, der Jude',
							url_librivox: 'https://librivox.org/x',
							sections: [
								{
									id: '1',
									section_number: '1',
									title: 'Kapitel 1',
									listen_url: 'https://example.invalid/a.mp3',
									playtime: '600',
									readers: [{ display_name: 'Testleser' }],
								},
							],
						},
					],
				}),
			});
		});

		await page.goto('/werke/abner-der-jude-der-nichts-gesehen-hat');
		const player = page.locator('details.player-container');
		await expect(player).toContainText('Abner, der Jude');

		await player.locator('summary').click();
		await expect(page.getByText('Kapitel 1')).toBeVisible();
		expect(apiCalls).toBeGreaterThan(0);
	});

	// The header and the work-page controls are rendered from a client-side
	// session fetch, so page HTML stays identical for every visitor and can be
	// cached at the edge. This covers the whole signed-in path end to end.
	test('signed-in state hydrates client-side', async ({ page, isMobile, playwright }) => {
		if (isMobile) return;

		const username = 'e2e_session_user';
		const email = `${username}@example.com`;
		const password = 'sehr-geheimes-passwort-123';

		// Registration is rate limited per IP, so the account is created once via a
		// throwaway context (keeping its session cookie out of the browser) and the
		// UI flow below signs in normally. A re-run reuses the same account.
		const api = await playwright.request.newContext({ baseURL: 'http://localhost:5173' });
		await api.post('/registrieren', {
			form: { username, email, password, password_confirm: password },
			failOnStatusCode: false,
		});
		await api.dispose();

		await page.goto('/login');
		// enhance() only intercepts once hydrated; submitting earlier races it.
		await page.waitForLoadState('networkidle');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL((u) => !u.pathname.startsWith('/login'));

		await expect(page.locator('.user-link')).toHaveText(username);

		// A cacheable page: the HTML is anonymous, the controls fill in after.
		await page.goto('/werke/der-golem');
		await expect(page.locator('.user-link')).toHaveText(username);
		await expect(page.locator('.action-buttons')).toBeVisible();

		// Toggle to a known state, then confirm it survived the round trip.
		const bookmark = page.locator('form[action="?/toggleBookmark"] button');
		if (await bookmark.evaluate((el) => el.classList.contains('active'))) {
			await bookmark.click();
			await expect(bookmark).not.toHaveClass(/active/);
		}
		await bookmark.click();
		await expect(bookmark).toHaveClass(/active/);
		await page.reload();
		await expect(bookmark).toHaveClass(/active/);

		await page.goto('/konto');
		await expect(page.locator('.value-text').first()).toHaveText(username);

		await page.goto('/');
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await expect(page.getByRole('link', { name: 'Anmelden' })).toBeVisible();
		await expect(page.locator('.user-link')).toHaveCount(0);
	});
});
