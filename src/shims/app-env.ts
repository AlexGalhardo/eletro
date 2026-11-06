/** Stand-in for `$app/env` now that the site is an Astro build, not a SvelteKit app. */
export const dev = import.meta.env.DEV;
export const building = false;
export const browser = typeof window !== "undefined";
