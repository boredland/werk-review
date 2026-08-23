import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { werkData } from './scripts/vite-plugin-werk-data';

export default defineConfig({
	plugins: [werkData(), sveltekit()],
});
