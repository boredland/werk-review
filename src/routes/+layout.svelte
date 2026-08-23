<script lang="ts">
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import '../app.css';
import Header from '$lib/components/layout/Header.svelte';
import { session } from '$lib/session.svelte';

let { children } = $props();

const canonicalUrl = $derived(`https://werk.review${page.url.pathname.replace(/\/$/, '') || '/'}`);

// Runs on first render and after every client-side navigation, so signing in or
// out is reflected without the session ever being rendered into the HTML.
afterNavigate(() => session.load());
</script>

<svelte:head>
	<meta name="description" content="Datenbank klassischer Literatur – Autoren, Werke und Bewertungen" />
	<meta property="og:site_name" content="werk.review" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://werk.review/icon-512.png" />
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta name="twitter:card" content="summary" />
	<link rel="alternate" type="application/rss+xml" title="werk.review – Neue Bewertungen" href="/feed.xml" />
	<link rel="canonical" href={canonicalUrl} />
</svelte:head>

<Header />

<main>
	{@render children()}
</main>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<span class="footer-title">werk<span class="footer-dot">.</span>review</span>
			<span class="footer-tagline">Datenbank klassischer Literatur</span>
		</div>
		<div class="footer-links">
			<a href="/autoren">Autoren</a>
			<a href="/werke">Werke</a>
			<a href="/genre">Genre</a>
			<a href="/vorschlaege">Vorschlagen</a>
			<a href="/konto">Konto</a>
			<a href="https://github.com/boredland/werk-review" target="_blank" rel="noopener noreferrer">GitHub</a>
			<a href="/ueber-uns">Über uns</a>
			<a href="/impressum">Impressum</a>
			<a href="/datenschutz">Datenschutz</a>
		</div>
		<p class="footer-copy">&copy; {new Date().getFullYear()} werk.review</p>
	</div>
</footer>

<style>
	.footer {
		margin-top: auto;
		border-top: 1px solid var(--color-border);
		background: var(--color-surface);
		padding: 2.5rem 1.5rem 1.5rem;
	}

	.footer-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.footer-title {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.footer-dot {
		color: var(--color-accent);
	}

	.footer-tagline {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-links a {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: var(--color-accent);
		text-decoration: none;
	}

	.footer-copy {
		margin: 0;
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.footer {
			padding: 2rem 1rem 1.25rem;
		}

		.footer-links {
			flex-wrap: wrap;
			justify-content: center;
			gap: 1rem;
		}
	}
</style>
