import { expect, test } from "@playwright/test";

const POST = "/melhor-airfryer-8-litros";

test.describe("home", () => {
	test("filters posts by category", async ({ page }) => {
		await page.goto("/");
		const cards = page.locator("main a[href^='/']");
		await expect(cards).toHaveCount(8);

		await page.getByRole("button", { name: "Móveis" }).click();

		await expect(page.getByRole("button", { name: "Móveis" })).toHaveAttribute("aria-pressed", "true");
		await expect(cards).toHaveCount(3);
		await expect(cards.first()).toContainText(/sofá|poltrona|mesa/i);
	});

	test("loads more posts while scrolling", async ({ page }) => {
		await page.goto("/");
		const cards = page.locator("main a[href^='/']");
		await expect(cards).toHaveCount(8);

		await page.mouse.wheel(0, 20000);

		await expect.poll(() => cards.count()).toBeGreaterThan(8);
	});

	test("opens the category linked from the footer", async ({ page }) => {
		await page.goto("/?categoria=moveis");

		await expect(page.getByRole("button", { name: "Móveis" })).toHaveAttribute("aria-pressed", "true");
		await expect(page.locator("main a[href^='/']")).toHaveCount(3);
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

		await page.getByRole("textbox", { name: "Buscar" }).fill("maquina de lavar");
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

		await expect(page).toHaveURL("/sobre");
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

test.describe("contact", () => {
	test("rejects an incomplete form without sending", async ({ page }) => {
		await page.goto("/contato");
		await page.getByLabel("Seu nome").fill("Maria");
		await page.getByLabel("Seu email").fill("nao-e-email");
		await page.getByLabel("Mensagem").fill("curta");

		await page.getByRole("button", { name: "Enviar Mensagem" }).click();

		await expect(page.getByText("Email inválido")).toBeVisible();
		await expect(page.getByText("A mensagem deve ter pelo menos 32 caracteres")).toBeVisible();
		await expect(page.getByRole("status")).toHaveCount(0);
	});

	test("sends a valid message and clears the form", async ({ page }) => {
		await page.goto("/contato");
		await page.getByLabel("Seu nome").fill("Maria Silva");
		await page.getByLabel("Seu email").fill("maria@example.com");
		await page
			.getByLabel("Mensagem")
			.fill("Olá, gostaria de sugerir uma análise de cafeteiras elétricas.");

		await page.getByRole("button", { name: "Enviar Mensagem" }).click();

		await expect(page.getByRole("status")).toHaveText("Mensagem enviada com sucesso!");
		await expect(page.getByLabel("Mensagem")).toHaveValue("");
	});
});

test("unknown pages show a 404 with a way back", async ({ page }) => {
	const response = await page.goto("/esta-pagina-nao-existe");

	expect(response?.status()).toBe(404);
	await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
	await page.getByRole("link", { name: "Voltar para o início" }).click();
	await expect(page).toHaveURL("/");
});
