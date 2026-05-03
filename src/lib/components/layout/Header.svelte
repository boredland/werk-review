<script lang="ts">
import { enhance } from '$app/forms';
import { page } from '$app/state';

const navItems = [
	{ href: '/autoren', label: 'Autoren' },
	{ href: '/werke', label: 'Werke' },
	{ href: '/genre', label: 'Genre' },
	{ href: '/ueber-uns', label: 'Über uns' },
];

let searchQuery = $state('');
let mobileOpen = $state(false);

const user = $derived(page.data.user);

function handleSearch(e: SubmitEvent) {
	e.preventDefault();
	if (searchQuery.trim()) {
		window.location.href = `/suche?q=${encodeURIComponent(searchQuery.trim())}`;
	}
}
</script>

<header class="header">
	<div class="header-top">
		<div class="header-inner">
			<a href="/" class="site-title">
				<span class="site-title-mark">werk</span><span class="site-title-dot">.</span><span class="site-title-review">review</span>
			</a>

			<div class="header-right">
				{#if user}
					<a href="/konto" class="user-link">{user.username}</a>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="auth-btn">Abmelden</button>
					</form>
				{:else}
					<a href="/login" class="auth-btn">Anmelden</a>
					<a href="/registrieren" class="auth-btn auth-btn--accent">Registrieren</a>
				{/if}

				<button
					class="mobile-toggle"
					onclick={() => mobileOpen = !mobileOpen}
					aria-label="Navigation öffnen"
					aria-expanded={mobileOpen}
				>
					<span class="mobile-bar"></span>
					<span class="mobile-bar"></span>
					<span class="mobile-bar"></span>
				</button>
			</div>
		</div>
	</div>

	<nav class="nav" class:nav-open={mobileOpen} aria-label="Hauptnavigation">
		<div class="nav-inner">
			<ul class="nav-list">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="nav-link"
							class:active={page.url.pathname.startsWith(item.href)}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>

			<form onsubmit={handleSearch} role="search" class="nav-search">
				<label for="nav-search-input" class="sr-only">Suche</label>
				<input
					id="nav-search-input"
					type="search"
					placeholder="Suchen…"
					bind:value={searchQuery}
				/>
			</form>
		</div>
	</nav>
</header>

<style>
	.header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-top {
		border-bottom: 1px solid var(--color-border-light);
	}

	.header-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0.9rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.site-title {
		font-family: var(--font-display);
		font-size: 1.65rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		text-decoration: none;
		color: var(--color-text);
	}

	.site-title:hover {
		text-decoration: none;
		color: var(--color-text);
	}

	.site-title-dot {
		color: var(--color-accent);
	}

	.site-title-review {
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.user-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		padding: 0.3rem 0;
	}

	.user-link:hover {
		color: var(--color-accent);
		text-decoration: none;
	}

	.auth-btn {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		padding: 0.35rem 0.85rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		text-decoration: none;
		transition: all 0.2s;
	}

	.auth-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		text-decoration: none;
	}

	.auth-btn--accent {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}

	.auth-btn--accent:hover {
		background: var(--color-accent-hover);
		border-color: var(--color-accent-hover);
		color: #fff;
	}

	button.auth-btn {
		font: inherit;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.mobile-toggle {
		display: none;
		flex-direction: column;
		gap: 4px;
		padding: 0.4rem;
		background: none;
		border: none;
		cursor: pointer;
	}

	.mobile-bar {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--color-text);
		transition: transform 0.2s;
	}

	.nav {
		border-bottom: 1px solid var(--color-border-light);
	}

	.nav-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0;
	}

	.nav-link {
		font-family: var(--font-ui);
		display: block;
		padding: 0.7rem 1rem;
		color: var(--color-text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-decoration: none;
		border-bottom: 2px solid transparent;
		transition: color 0.2s, border-color 0.2s;
	}

	.nav-link:hover {
		color: var(--color-text);
		text-decoration: none;
	}

	.nav-link.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.nav-search input {
		font-family: var(--font-ui);
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--color-border-light);
		background: var(--color-surface-warm);
		font-size: 0.85rem;
		width: 200px;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.nav-search input::placeholder {
		color: var(--color-text-muted);
	}

	.nav-search input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}

	@media (max-width: 640px) {
		.header-inner {
			padding: 0.75rem 1rem;
		}

		.mobile-toggle {
			display: flex;
		}

		.nav {
			display: none;
		}

		.nav.nav-open {
			display: block;
		}

		.nav-inner {
			flex-direction: column;
			padding: 0.5rem 1rem;
		}

		.nav-list {
			flex-direction: column;
			width: 100%;
		}

		.nav-link {
			width: 100%;
			padding: 0.65rem 0;
			border-bottom-width: 0;
			border-left: 2px solid transparent;
			padding-left: 0.75rem;
		}

		.nav-link.active {
			border-bottom-color: transparent;
			border-left-color: var(--color-accent);
		}

		.nav-search {
			width: 100%;
			padding: 0.5rem 0;
		}

		.nav-search input {
			width: 100%;
		}

		.auth-btn {
			font-size: 0.78rem;
			padding: 0.3rem 0.6rem;
		}
	}
</style>
