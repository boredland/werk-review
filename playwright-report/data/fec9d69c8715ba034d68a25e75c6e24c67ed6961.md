# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.test.ts >> werk.review E2E >> mobile menu functionality
- Location: tests/e2e.test.ts:57:2

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.mobile-toggle')
    - locator resolved to <button aria-expanded="false" aria-label="Navigation öffnen" class="mobile-toggle svelte-hv3zzy">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="header-right svelte-hv3zzy">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="header-right svelte-hv3zzy">…</div> intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="header-inner svelte-hv3zzy">…</div> intercepts pointer events
  11 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="header-right svelte-hv3zzy">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="header-right svelte-hv3zzy">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="header-inner svelte-hv3zzy">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="header-inner svelte-hv3zzy">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="header-right svelte-hv3zzy">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - link "werk.review" [ref=e6] [cursor=pointer]:
        - /url: /
      - generic [ref=e7]:
        - link "Anmelden" [ref=e8] [cursor=pointer]:
          - /url: /login
        - link "Registrieren" [ref=e9] [cursor=pointer]:
          - /url: /registrieren
        - button "Dunkles Design" [ref=e10] [cursor=pointer]:
          - img [ref=e11]
        - button "Navigation öffnen" [ref=e13] [cursor=pointer]
  - main [ref=e17]:
    - generic [ref=e18]:
      - heading "Willkommen werter Suchender," [level=1] [ref=e19]
      - paragraph [ref=e20]: diese Website ist eine Datenbank der klassischen Literatur. Bibliothekarisch sind hier die wichtigsten klassischen Autoren mit all ihren Werken eingepflegt, welche in deutscher Sprache erhältlich sind.
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: "1"
          - generic [ref=e24]: Autoren
        - generic [ref=e26]:
          - generic [ref=e27]: "50"
          - generic [ref=e28]: Werke
        - generic [ref=e30]:
          - generic [ref=e31]: "8"
          - generic [ref=e32]: Genres
    - generic [ref=e33]:
      - generic [ref=e34]:
        - heading "Autoren" [level=2] [ref=e35]
        - link "Alle anzeigen" [ref=e36] [cursor=pointer]:
          - /url: /autoren
      - link "Gottfried Keller 1819–1890" [ref=e38] [cursor=pointer]:
        - /url: /autoren/gottfried-keller
        - generic [ref=e39]:
          - generic [ref=e40]: Gottfried Keller
          - generic [ref=e41]: 1819–1890
    - generic [ref=e42]:
      - generic [ref=e43]:
        - heading "Werke" [level=2] [ref=e44]
        - link "Alle anzeigen" [ref=e45] [cursor=pointer]:
          - /url: /werke
      - generic [ref=e46]:
        - link "1854–1855 Der grüne Heinrich. Erste Fassung" [ref=e47] [cursor=pointer]:
          - /url: /werke/der-gruene-heinrich-erste-fassung
          - generic [ref=e48]: 1854–1855
          - generic [ref=e49]: Der grüne Heinrich. Erste Fassung
        - link "1856 Die drei gerechten Kammacher" [ref=e50] [cursor=pointer]:
          - /url: /werke/die-drei-gerechten-kammacher
          - generic [ref=e51]: "1856"
          - generic [ref=e52]: Die drei gerechten Kammacher
        - link "1856 Die Leute von Seldwyla. Teil I" [ref=e53] [cursor=pointer]:
          - /url: /werke/die-leute-von-seldwyla-teil-i
          - generic [ref=e54]: "1856"
          - generic [ref=e55]: Die Leute von Seldwyla. Teil I
        - link "1856 Frau Regel Amrain und ihr Jüngster" [ref=e56] [cursor=pointer]:
          - /url: /werke/frau-regel-amrain-und-ihr-juengster
          - generic [ref=e57]: "1856"
          - generic [ref=e58]: Frau Regel Amrain und ihr Jüngster
        - link "1856 Pankraz, der Schmoller" [ref=e59] [cursor=pointer]:
          - /url: /werke/pankraz-der-schmoller
          - generic [ref=e60]: "1856"
          - generic [ref=e61]: Pankraz, der Schmoller
        - link "1856 Romeo und Julia auf dem Dorfe" [ref=e62] [cursor=pointer]:
          - /url: /werke/romeo-und-julia-auf-dem-dorfe
          - generic [ref=e63]: "1856"
          - generic [ref=e64]: Romeo und Julia auf dem Dorfe
    - generic [ref=e65]:
      - generic [ref=e66]:
        - heading "Genres" [level=2] [ref=e67]
        - link "Alle anzeigen" [ref=e68] [cursor=pointer]:
          - /url: /genre
      - generic [ref=e69]:
        - link "Roman" [ref=e70] [cursor=pointer]:
          - /url: /genre/roman
        - link "Erzählung" [ref=e71] [cursor=pointer]:
          - /url: /genre/erzaehlung
        - link "Erzählband" [ref=e72] [cursor=pointer]:
          - /url: /genre/erzaehlband
        - link "Prosa" [ref=e73] [cursor=pointer]:
          - /url: /genre/prosa
        - link "Novelle" [ref=e74] [cursor=pointer]:
          - /url: /genre/novelle
        - link "Drama" [ref=e75] [cursor=pointer]:
          - /url: /genre/drama
        - link "Abenteuerroman" [ref=e76] [cursor=pointer]:
          - /url: /genre/abenteuerroman
        - link "Historischer Roman" [ref=e77] [cursor=pointer]:
          - /url: /genre/historischer-roman
  - contentinfo [ref=e78]:
    - generic [ref=e79]:
      - generic [ref=e80]:
        - generic [ref=e81]: werk.review
        - generic [ref=e82]: Datenbank klassischer Literatur
      - generic [ref=e83]:
        - link "Autoren" [ref=e84] [cursor=pointer]:
          - /url: /autoren
        - link "Werke" [ref=e85] [cursor=pointer]:
          - /url: /werke
        - link "Genre" [ref=e86] [cursor=pointer]:
          - /url: /genre
        - link "Vorschlagen" [ref=e87] [cursor=pointer]:
          - /url: /vorschlaege
        - link "Konto" [ref=e88] [cursor=pointer]:
          - /url: /konto
        - link "GitHub" [ref=e89] [cursor=pointer]:
          - /url: https://github.com/boredland/werk-review
        - link "Impressum" [ref=e90] [cursor=pointer]:
          - /url: /impressum
        - link "Datenschutz" [ref=e91] [cursor=pointer]:
          - /url: /datenschutz
      - paragraph [ref=e92]: © 2026 werk.review
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('werk.review E2E', () => {
  4  | 	test('homepage loads and shows hero', async ({ page, isMobile }) => {
  5  | 		await page.goto('/');
  6  | 		await expect(page.locator('h1')).toContainText('Willkommen werter Suchender');
  7  | 		if (!isMobile) {
  8  | 			await expect(page.locator('nav')).toBeVisible();
  9  | 		}
  10 | 	});
  11 | 
  12 | 	test('search for a work and navigate to it', async ({ page, isMobile }) => {
  13 | 		if (isMobile) return;
  14 | 		await page.goto('/');
  15 | 		const searchInput = page.locator('#nav-search-input');
  16 | 		await searchInput.fill('Sinngedicht');
  17 | 		await searchInput.press('Enter');
  18 | 
  19 | 		await expect(page).toHaveURL(/\/suche\?q=Sinngedicht/);
  20 | 		await expect(page.locator('h2')).toContainText('Werke');
  21 | 		
  22 | 		const workLink = page.getByRole('link', { name: /Das Sinngedicht/i });
  23 | 		await expect(workLink).toBeVisible();
  24 | 		await workLink.click();
  25 | 
  26 | 		await expect(page).toHaveURL(/\/werke\/das-sinngedicht/);
  27 | 		await expect(page.locator('h1')).toContainText('Das Sinngedicht');
  28 | 	});
  29 | 
  30 | 	test('work page displays external links and formats', async ({ page }) => {
  31 | 		// Using a known work with IA links
  32 | 		await page.goto('/werke/die-drei-gerechten-kammacher');
  33 | 		
  34 | 		await expect(page.locator('h1')).toContainText('Die drei gerechten Kammacher');
  35 | 		
  36 | 		// Check for "Lesen & Hören" section
  37 | 		await expect(page.locator('section.external-links')).toBeVisible();
  38 | 		
  39 | 		// Check for Internet Archive card
  40 | 		const iaCard = page.locator('.link-card', { hasText: 'Internet Archive' });
  41 | 		await expect(iaCard).toBeVisible();
  42 | 		
  43 | 		// Check for format tags (like EPUB or PDF)
  44 | 		const formatTags = iaCard.locator('.format-tag');
  45 | 		expect(await formatTags.count()).toBeGreaterThan(0);
  46 | 	});
  47 | 
  48 | 	test('author page loads correctly', async ({ page }) => {
  49 | 		await page.goto('/autoren/gottfried-keller');
  50 | 		await expect(page.locator('h1')).toContainText('Gottfried Keller');
  51 | 		
  52 | 		// Check if some works are listed
  53 | 		const workItems = page.locator('.work-row');
  54 | 		expect(await workItems.count()).toBeGreaterThan(0);
  55 | 	});
  56 | 
  57 | 	test('mobile menu functionality', async ({ page, isMobile }) => {
  58 | 		if (!isMobile) return;
  59 | 
  60 | 		await page.goto('/');
  61 | 		const menuBtn = page.locator('.mobile-toggle');
  62 | 		await expect(menuBtn).toBeVisible();
  63 | 		
> 64 | 		await menuBtn.click();
     |                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  65 | 		await expect(page.locator('nav.nav-open')).toBeVisible();
  66 | 	});
  67 | });
  68 | 
```