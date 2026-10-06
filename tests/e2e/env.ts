import { tmpdir } from "node:os";
import path from "node:path";

// The throwaway admin the e2e server runs with (see `webServer.env` in playwright.config.ts).
export const ADMIN = "e2e-admin";
export const LOGIN_TOKEN = "e2e-login-token";
/** Scratch folder that receives what the dashboard writes, so tests never touch the real content. */
export const CONTENT_ROOT = path.join(tmpdir(), "sveltekit-blog-cms-e2e");

/**
 * Opens a page and waits until it is quiet, which is when Svelte has hydrated it.
 * A click that lands before hydration finds a button with no handler yet and does nothing.
 */
export const open = (page: import("@playwright/test").Page, url: string) =>
	page.goto(url, { waitUntil: "networkidle" });
