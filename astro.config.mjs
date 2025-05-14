// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
	site: "https://suggestify.ahmetalmaz.com",
	trailingSlash: "never",
	output: "server",
	build: {
		format: "file",
	},
	vite: {
		define: {
			"process.env.ASTRO_DB_REMOTE_URL": JSON.stringify(
				process.env.ASTRO_DB_REMOTE_URL
			),
			"process.env.ASTRO_DB_APP_TOKEN": JSON.stringify(
				process.env.ASTRO_DB_APP_TOKEN
			),
		},
		plugins: [tailwindcss()],
		resolve: {
			alias: import.meta.env.PROD && {
				"react-dom/server": "react-dom/server.edge",
			},
		},
	},
	integrations: [react(), db()],
	adapter: cloudflare({
		imageService: "passthrough",
	}),
});
