<script lang="ts">
import { browser } from '$app/environment';

let dark = $state(false);

if (browser) {
	dark = document.documentElement.getAttribute('data-theme') === 'dark';
}

function toggle() {
	dark = !dark;
	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	localStorage.setItem('theme', dark ? 'dark' : 'light');
}
</script>

<button class="theme-toggle" onclick={toggle} aria-label={dark ? 'Helles Design' : 'Dunkles Design'}>
	{#if dark}
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
			<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
		</svg>
	{:else}
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M14 9.5A6.5 6.5 0 016.5 2 5.5 5.5 0 1014 9.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s;
	}

	.theme-toggle:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
