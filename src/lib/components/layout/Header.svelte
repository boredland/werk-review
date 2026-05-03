<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const navItems = [
		{ href: '/autoren', label: 'Autoren' },
		{ href: '/werke', label: 'Werke' },
		{ href: '/genre', label: 'Genre' },
		{ href: '/ueber-uns', label: 'Über uns' }
	];

	let searchQuery = $state('');

	const user = $derived(page.data.user);

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/suche?q=${encodeURIComponent(searchQuery.trim())}`;
		}
	}
</script>

<header class="header">
	<div class="header-inner">
		<a href="/" class="site-title">Datenbank klassischer Literatur</a>

		<div class="header-right">
			{#if user}
				<span class="user-greeting">{user.username}</span>
				<form method="POST" action="/logout" use:enhance>
					<button type="submit" class="auth-link">Abmelden</button>
				</form>
			{:else}
				<a href="/login" class="auth-link">Login</a>
				<a href="/registrieren" class="auth-link auth-link--primary">Registrieren</a>
			{/if}
		</div>
	</div>

	<nav class="nav" aria-label="Hauptnavigation">
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
			<li class="nav-search">
				<form onsubmit={handleSearch} role="search">
					<label for="nav-search-input" class="sr-only">Suche</label>
					<input
						id="nav-search-input"
						type="search"
						placeholder="Suche"
						bind:value={searchQuery}
					/>
				</form>
			</li>
		</ul>
	</nav>
</header>

<style>
	.header {
		border-bottom: 2px solid var(--color-border);
		background: var(--color-surface);
	}

	.header-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 1rem 1rem 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.site-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		color: var(--color-text);
		text-decoration: none;
	}

	.header-right {
		display: flex;
		gap: 0.5rem;
	}

	.auth-link {
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--color-accent);
		border-radius: 4px;
		font-size: 0.85rem;
		color: var(--color-accent);
	}

	.auth-link--primary {
		background: var(--color-accent);
		color: #fff;
	}

	.auth-link:hover {
		text-decoration: none;
		opacity: 0.85;
	}

	.user-greeting {
		font-size: 0.85rem;
		color: var(--color-text);
		padding: 0.35rem 0;
	}

	button.auth-link {
		background: none;
		cursor: pointer;
		font: inherit;
	}

	.nav {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 1rem;
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
		display: block;
		padding: 0.75rem 1rem;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.nav-link:hover,
	.nav-link.active {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: 600;
	}

	.nav-search {
		margin-left: auto;
	}

	.nav-search input {
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.9rem;
		width: 180px;
	}

	.nav-search input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}
</style>
