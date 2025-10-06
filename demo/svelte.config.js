import { mdsvex } from "mdsvex";
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import enhancedImage from '../dist/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [[
				enhancedImage,
				{
					// Optional: attributes to add to **all** `img` tags
					attributes: {
						fetchpriority: "auto", // browser's default
						loading: "eager", // browser's default
						decoding: "auto", // browser's default
						class: "test-decoration"
					},
					// Optional: imagetools directives to add to **all** `img` tags
					// see https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md#format
					imagetoolsDirectives:{
						effort: 'max',
						normalize: true,
						median: true,
						quality: 100,
						background: "transparent",
						brightness: 0.9,
						contrast: 1.1,
					}
				}
			]]
		})
	],


	kit: {
		// Configure for GitHub Pages deployment
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/mdsvex-enhanced-images' : ''
		}
	}
};

export default config;
