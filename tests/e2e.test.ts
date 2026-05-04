import { test, expect } from '@playwright/test';

test.describe('werk.review E2E', () => {
	test('homepage loads and shows hero', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Willkommen werter Suchender');
		await expect(page.locator('nav')).toBeVisible();
	});

	test('search for a work and navigate to it', async ({ page }) => {
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
});
