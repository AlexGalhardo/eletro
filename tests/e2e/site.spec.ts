import type { Page } from "@playwright/test";
import { expect, test } from "./test.ts";

const POST = "/melhor-airfryer-8-litros";

// Desktop filters with the sidebar buttons; below lg the categories live in the hamburger menu as links.
async function chooseCategory(page: Page, isMobile: boolean, name: string): Promise<void> {
	if (!isMobile) return page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
	await page.getByRole("button", { name: "Abrir menu" }).click();
	await page.getByRole("dialog").getByRole("link", { name, exact: true }).click();
}

test.describe("home", () => {
	test("filters posts by category", async ({ page, isMobile }) => {
		await page.goto("/");
		const cards = page.locator("main [data-post]:visible");
		await expect(cards).toHaveCount(8);

		await chooseCategory(page, isMobile, "Móveis");

		if (!isMobile)
			await expect(page.getByRole("button", { name: /^Móveis/ })).toHaveAttribute(
				"aria-pressed",
				"true",
			);
		else await expect(page.getByText("Categoria: Móveis")).toBeVisible();
		await expect(cards).toHaveCount(3);
		await expect(cards.first()).toContainText(/sofá|poltrona|mesa/i);
	});

	test("offers only categories that have a published post, in the filter and in the footer", async ({
		page,
		isMobile,
	}) => {
		await page.goto("/");
		let labels: string[];
		if (isMobile) {
			await page.getByRole("button", { name: "Abrir menu" }).click();
			// "Todos" and the logo also link to "/", so only the category links are read; "Todos" is checked apart.
			const dialog = page.getByRole("dialog");
			await expect(dialog.getByRole("link", { name: "Todos", exact: true })).toHaveAttribute(
				"href",
				"/",
			);
			const links = dialog.locator("nav a[href^='/?categoria=']");
			labels = ["Todos", ...(await links.allTextContents()).map((label) => label.trim())];
			await page.getByRole("button", { name: "Fechar menu" }).click();
			await expect(dialog).toBeHidden();
		} else {
			const filters = page.locator("main button[aria-pressed]");
			labels = await filters.evaluateAll((buttons) =>
				buttons.map((button) => button.getAttribute("data-label") ?? ""),
			);
		}

		expect(labels[0]).toBe("Todos");
		for (const label of labels.slice(1)) {
			await chooseCategory(page, isMobile, label);
			await expect(page.locator("main [data-post]:visible").first(), label).toBeVisible();
		}
		await expect(page.locator("footer nav[aria-label='Categorias'] a")).toHaveText(labels.slice(1));
	});

	test("loads more posts while scrolling", async ({ page }) => {
		await page.goto("/");
		const cards = page.locator("main [data-post]:visible");
		await expect(cards).toHaveCount(8);

		await page.mouse.wheel(0, 20000);

		await expect.poll(() => cards.count()).toBeGreaterThan(8);
	});

	test("opens the category linked from the footer", async ({ page, isMobile }) => {
		await page.goto("/?categoria=moveis");

		if (!isMobile)
			await expect(page.getByRole("button", { name: /^Móveis/ })).toHaveAttribute(
				"aria-pressed",
				"true",
			);
		else await expect(page.getByText("Categoria: Móveis")).toBeVisible();
		await expect(page.locator("main [data-post]:visible")).toHaveCount(3);
	});

	test("remembers the dark theme across visits", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("html")).not.toHaveClass(/dark/);

		await page.getByRole("button", { name: "Alternar tema" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);

		await page.reload();
		await expect(page.locator("html")).toHaveClass(/dark/);
	});

	test("accepting cookies hides the banner for good", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "OK" }).click();
		await expect(page.getByText("Nós usamos cookies")).toBeHidden();

		await page.reload();
		await expect(page.getByRole("button", { name: "Alternar tema" })).toBeVisible();
		await expect(page.getByText("Nós usamos cookies")).toBeHidden();
	});
});

test.describe("search and navigation", () => {
	test("finds a post ignoring accents and opens it", async ({ page, isMobile }) => {
		await page.goto("/");
		if (isMobile) await page.getByRole("button", { name: "Buscar" }).click();

		const search = page.getByRole("textbox", { name: "Buscar" });
		await search.fill("maquina de lavar");
		await search.blur();
		await search.focus();
		expect(
			await search.evaluate(
				(input: HTMLInputElement) =>
					input.selectionStart === 0 && input.selectionEnd === input.value.length,
			),
		).toBe(true);
		const option = page.getByRole("option").first();
		await expect(option).toContainText(/máquina de lavar/i);
		await option.click();

		await expect(page).toHaveURL(/\/melhor-maquina-lavar/);
		await expect(page.getByRole("heading", { level: 1 })).toContainText(/máquina de lavar/i);
	});

	test("mobile menu links to the institutional pages", async ({ page, isMobile }) => {
		test.skip(!isMobile, "The side menu only exists on small screens");
		await page.goto("/");

		await page.getByRole("button", { name: "Abrir menu" }).click();
		await page.getByRole("dialog").getByRole("link", { name: "Sobre" }).click();

		await expect(page).toHaveURL(/\/sobre\/?$/);
		await expect(page.getByRole("dialog")).toBeHidden();
		await expect(page.getByRole("heading", { level: 1, name: "Sobre" })).toBeVisible();
	});

	test("footer offers institutional, legal and category links", async ({ page }) => {
		await page.goto("/");
		const footer = page.locator("footer");

		for (const name of ["Sobre", "Contato", "Termos de Uso", "Política de Privacidade", "Cozinha"]) {
			await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
		}
		await expect(footer).toContainText("comissões de afiliado");
		await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
	});
});

test.describe("post", () => {
	// The page asks the links dashboard whether it is up. Answered here so no test depends on the network.
	const HEALTH = "**/links.lekzera.xyz/health";
	test.beforeEach(async ({ page }) => {
		await page.route(HEALTH, (route) => route.fulfill({ json: { status: "ok" } }));
	});

	test("store buttons go straight to the store while the links dashboard is down", async ({ page }) => {
		await page.unroute(HEALTH);
		await page.route(HEALTH, (route) => route.fulfill({ status: 503, json: { status: "down" } }));
		await page.goto(POST);

		const store = page.getByRole("link", { name: /VER PREÇO MERCADOLIVRE/ }).first();
		await expect(store).toHaveAttribute("href", /^https:\/\/(meli\.la|www\.mercadolivre\.com\.br)\//);
		await expect(page.locator('[data-testid="cards-table"] a[href*="/link?id="]')).toHaveCount(0);
	});

	test("shows the article with author, sharing and affiliate product cards", async ({ page }) => {
		await page.goto(POST);

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Air Fryer 8 Litros/);
		await expect(page.getByText(/POSTADO EM \d+ de \w+ de \d{4}/i)).toBeVisible();
		await expect(page.getByText(/minutos? de leitura/)).toBeVisible();
		await expect(page.getByText("Bruno Souza")).toBeVisible();
		await expect(page.getByRole("link", { name: "Compartilhar no WhatsApp" }).first()).toHaveAttribute(
			"href",
			/wa\.me.*eletroradar\.com\.br%2Fmelhor-airfryer-8-litros/,
		);

		const store = page.getByRole("link", { name: /VER PREÇO MERCADOLIVRE/ }).first();
		await expect(store).toHaveAttribute("href", /^https:\/\//);
		// Store buttons go through the links dashboard redirect while the dashboard answers.
		await expect(store).toHaveAttribute(
			"href",
			/\/link\?id=.*melhor-airfryer-8-litros.*&store=mercadolivre$/,
		);
		await expect(page.locator('[data-testid="cards-table"] a[href*="meli.la"]')).toHaveCount(0);
		await expect(store).toHaveAttribute("target", "_blank");
		await expect(store).toHaveAttribute("rel", /sponsored/);
		await expect(page.getByRole("heading", { name: "Perguntas Frequentes" })).toBeVisible();
	});

	test("navigating between posts swaps the content and its products", async ({ page, isMobile }) => {
		await page.goto(POST);
		if (isMobile) await page.getByRole("button", { name: "Buscar" }).click();

		await page.getByRole("textbox", { name: "Buscar" }).fill("ventilador de teto");
		await page.getByRole("option").first().click();

		await expect(page.getByRole("heading", { level: 1 })).toContainText(/ventilador de teto/i);
		await expect(page.getByTestId("cards-table")).toBeVisible();
		await expect(page.getByText("Nenhum produto encontrado")).toHaveCount(0);
	});
});

test("contact provides a working mail link on the static host", async ({ page }) => {
	await page.goto("/contato");
	await expect(page.getByRole("link", { name: "Enviar e-mail" })).toHaveAttribute(
		"href",
		"mailto:contato@example.com",
	);
});

test("unknown pages render the 404 page", async ({ page }) => {
	const response = await page.goto("/esta-pagina-nao-existe");

	expect(response?.status()).toBe(404);
	await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
});

test.describe("keyboard", () => {
	test.skip(({ isMobile }) => isMobile, "Tab navigation is a desktop interaction");

	for (const path of ["/", POST]) {
		test(`every Tab stop on ${path} is visible and has a name`, async ({ page }) => {
			await page.goto(path);

			const stops: string[] = [];
			for (let index = 0; index < 12; index++) {
				await page.keyboard.press("Tab");
				const stop = await page.evaluate(() => {
					const element = document.activeElement as HTMLElement | null;
					if (!element || element === document.body) return null;
					const box = element.getBoundingClientRect();
					return {
						name: (
							element.getAttribute("aria-label") ||
							element.textContent ||
							element.getAttribute("placeholder") ||
							element.getAttribute("title") ||
							""
						).trim(),
						visible: box.width > 0 && box.height > 0,
						tag: element.tagName.toLowerCase(),
					};
				});
				expect(stop, `Tab ${index + 1} lost the focus`).not.toBeNull();
				expect(stop?.visible, `Tab ${index + 1} landed on a hidden <${stop?.tag}>`).toBe(true);
				expect(stop?.name, `Tab ${index + 1} landed on an unnamed <${stop?.tag}>`).not.toBe("");
				stops.push(`${stop?.tag}:${stop?.name}`);
			}
			// Focus really moves: it is not stuck on one element.
			expect(new Set(stops).size).toBeGreaterThan(6);
		});
	}
});
