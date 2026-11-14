import type { APIRoute } from "astro";
import { site } from "#lib/site.config.ts";

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify({
			name: site.name,
			short_name: site.name,
			description: site.description,
			start_url: "/",
			display: "standalone",
			background_color: "#f5f4f0",
			theme_color: "#166534",
			icons: [
				{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
				{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
				{ src: site.logo, sizes: "any", type: "image/svg+xml" },
			],
		}),
		{ headers: { "Content-Type": "application/manifest+json" } },
	);
