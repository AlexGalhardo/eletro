import type { Page } from "@playwright/test";
import { expect } from "./test.ts";

/** Logs in through the real form, so the encrypted session and its IndexedDB key exist like in production. */
export async function login(page: Page, next = "/admin"): Promise<void> {
	await mockGithub(page);
	await page.goto(`/admin/login?next=${next}`);
	await page.getByPlaceholder("Password").fill("a-token");
	await page.getByRole("button", { name: "Login" }).click();
	await expect(page).toHaveURL((url) => url.pathname === next.split("?")[0]);
}

export async function mockGithub(page: Page): Promise<void> {
	await page.route("https://api.github.com/**", (route) => {
		const { pathname } = new URL(route.request().url());
		const body =
			pathname === "/user"
				? {}
				: pathname.includes("/contents/")
					? []
					: { permissions: { push: true } };
		return route.fulfill({ json: body });
	});
}
