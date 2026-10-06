import { render } from "@react-email/render";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type Database, getDb } from "../../src/lib/server/db/index.ts";
import { newsletterDelivery, newsletterDispatch, subscriber } from "../../src/lib/server/db/schema.ts";
import { type Email, outbox } from "../../src/lib/server/mailer.ts";
import {
	confirm,
	requestDispatch,
	runDispatches,
	subscribe,
	unsubscribe,
} from "../../src/lib/server/newsletter.ts";

// No RESEND_API_KEY: the mailer records every e-mail in `outbox` instead of sending it.
vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv({ CRON_SECRET: "cron-secret-0123456789abcdef0123456789" });
});

import * as confirmation from "../../src/routes/api/v1/newsletter/confirm/+server.ts";
import * as dispatches from "../../src/routes/api/v1/newsletter/dispatches/+server.ts";
import * as run from "../../src/routes/api/v1/newsletter/dispatches/run/+server.ts";
import * as subscribers from "../../src/routes/api/v1/newsletter/subscribers/+server.ts";
import * as leave from "../../src/routes/api/v1/newsletter/unsubscribe/+server.ts";

const ORIGIN = "https://blog.example";
const post = { title: "Melhor Cafeteira", description: "Resumo" };
const live = { origin: ORIGIN, livePost: () => post };

let db: Database;

/** The e-mail as the recipient gets it. */
const htmlOf = (email: Email) => render(email.react);
const tokenOf = async (email: Email) =>
	decodeURIComponent((await htmlOf(email)).match(/[?&;]token=([\w%-]+)/)?.[1] ?? "");
const statusOf = async (email: string) =>
	(await db.select().from(subscriber).where(eq(subscriber.email, email)))[0]?.status;
const dispatchOf = async (slug: string) =>
	(await db.select().from(newsletterDispatch).where(eq(newsletterDispatch.slug, slug)))[0];

/** Subscribes and follows the link of the confirmation e-mail. */
async function confirmed(email: string): Promise<string> {
	await subscribe(db, email, ORIGIN);
	const token = await tokenOf(outbox.at(-1) as Email);
	expect(await confirm(db, token)).toBe(true);
	return token;
}

beforeAll(async () => {
	db = await getDb();
});
beforeEach(async () => {
	outbox.length = 0;
	await db.delete(newsletterDelivery);
	await db.delete(newsletterDispatch);
	await db.delete(subscriber);
});

describe("subscription", () => {
	it("stays pending until the link of the confirmation e-mail is followed", async () => {
		await subscribe(db, "  Ana@Example.com ", ORIGIN);

		expect(outbox).toHaveLength(1);
		expect(outbox[0]).toMatchObject({
			to: "ana@example.com",
			subject: expect.stringContaining("Confirme"),
		});
		expect(await htmlOf(outbox[0] as Email)).toMatch(
			/href="https:\/\/blog\.example\/newsletter\/confirmar\?token=[\w-]{40,}"/,
		);
		expect(await statusOf("ana@example.com")).toBe("pending");

		expect(await confirm(db, "wrong-token")).toBe(false);
		expect(await confirm(db, "")).toBe(false);
		expect(await confirm(db, await tokenOf(outbox[0] as Email))).toBe(true);
		expect(await confirm(db, await tokenOf(outbox[0] as Email))).toBe(true);
		expect(await statusOf("ana@example.com")).toBe("confirmed");
	});

	it("does not e-mail a pending address again right away, nor a confirmed one ever", async () => {
		const later = new Date(Date.now() + 25 * 60 * 60 * 1000);

		await subscribe(db, "ana@example.com", ORIGIN);
		await subscribe(db, "ana@example.com", ORIGIN);
		expect(outbox).toHaveLength(1);

		await subscribe(db, "ana@example.com", ORIGIN, later);
		expect(outbox).toHaveLength(2);
		// The older link stops working once a new one is sent.
		expect(await confirm(db, await tokenOf(outbox[0] as Email))).toBe(false);
		expect(await confirm(db, await tokenOf(outbox[1] as Email))).toBe(true);

		await subscribe(db, "ana@example.com", ORIGIN, later);
		expect(outbox).toHaveLength(2);
	});

	it("stops e-mailing confirmations once too many addresses were added within the hour", async () => {
		await db.insert(subscriber).values(
			Array.from({ length: 60 }, (_, index) => ({
				id: `flood-${index}`,
				email: `flood${index}@example.com`,
				token: `flood-token-${index}`,
			})),
		);

		await subscribe(db, "ana@example.com", ORIGIN);
		expect(outbox).toHaveLength(0);

		// An hour later the window is clear again.
		await subscribe(db, "ana@example.com", ORIGIN, new Date(Date.now() + 61 * 60 * 1000));
		expect(outbox).toHaveLength(1);
	});

	it("unsubscribes with the token and lets the address subscribe again later", async () => {
		const token = await confirmed("ana@example.com");

		expect(await unsubscribe(db, "wrong-token")).toBe(false);
		expect(await unsubscribe(db, token)).toBe(true);
		expect(await unsubscribe(db, token)).toBe(true);
		expect(await statusOf("ana@example.com")).toBe("unsubscribed");

		await confirmed("ana@example.com");
		expect(await statusOf("ana@example.com")).toBe("confirmed");
	});
});

describe("announcing a post", () => {
	it("sends exactly one e-mail to each confirmed subscriber, once the post is live", async () => {
		const ana = await confirmed("ana@example.com");
		await confirmed("bia@example.com");
		await subscribe(db, "pendente@example.com", ORIGIN);
		await unsubscribe(db, await confirmed("saiu@example.com"));
		outbox.length = 0;

		await requestDispatch(db, "melhor-cafeteira", "admin");
		await requestDispatch(db, "melhor-cafeteira", "admin");
		expect(await db.select().from(newsletterDispatch)).toHaveLength(1);

		// The post is saved but its URL is not live yet: nothing goes out.
		expect(await runDispatches(db, { origin: ORIGIN, livePost: () => undefined })).toEqual([
			{ slug: "melhor-cafeteira", status: "waiting", recipients: 0 },
		]);
		expect(outbox).toHaveLength(0);

		expect(await runDispatches(db, live)).toEqual([
			{ slug: "melhor-cafeteira", status: "sent", recipients: 2 },
		]);
		expect(outbox.map((email) => email.to).sort()).toEqual(["ana@example.com", "bia@example.com"]);

		const toAna = outbox.find((email) => email.to === "ana@example.com") as Email;
		expect(toAna.subject).toBe("Melhor Cafeteira");
		const html = await htmlOf(toAna);
		expect(html).toContain('href="https://blog.example/melhor-cafeteira"');
		expect(html).toContain(`/newsletter/sair?token=${encodeURIComponent(ana)}`);
		expect(toAna.headers?.["List-Unsubscribe"]).toBe(
			`<https://blog.example/newsletter/sair?token=${encodeURIComponent(ana)}>`,
		);
		expect(await dispatchOf("melhor-cafeteira")).toMatchObject({ status: "sent", recipients: 2 });

		// Running or asking again never sends a second time.
		await runDispatches(db, live);
		await requestDispatch(db, "melhor-cafeteira", "admin");
		await runDispatches(db, live);
		expect(outbox).toHaveLength(2);
	});

	it("resumes a failed dispatch without e-mailing anyone twice", async () => {
		await db.insert(subscriber).values(
			Array.from({ length: 150 }, (_, index) => ({
				id: `s${index}`,
				email: `leitor${index}@example.com`,
				token: `token-${index}`,
				status: "confirmed" as const,
			})),
		);
		const sent: string[] = [];
		let calls = 0;
		const send = async (emails: Email[]) => {
			calls += 1;
			if (calls === 2) throw new Error("Resend rejected the batch: rate limited");
			sent.push(...emails.map((email) => email.to));
		};

		await requestDispatch(db, "melhor-cafeteira", "admin");
		expect(await runDispatches(db, { ...live, send })).toEqual([
			{ slug: "melhor-cafeteira", status: "failed", recipients: 100 },
		]);
		expect(await dispatchOf("melhor-cafeteira")).toMatchObject({
			status: "failed",
			error: expect.stringContaining("rate limited"),
		});

		// A failed dispatch is not retried by itself: the admin asks for it again.
		expect(await runDispatches(db, { ...live, send })).toEqual([]);
		await requestDispatch(db, "melhor-cafeteira", "admin");
		expect(await runDispatches(db, { ...live, send })).toEqual([
			{ slug: "melhor-cafeteira", status: "sent", recipients: 150 },
		]);

		expect(sent).toHaveLength(150);
		expect(new Set(sent).size).toBe(150);
	});
});

describe("endpoints", () => {
	type Handler = (event: never) => Response | Promise<Response>;
	const admin = { id: "1", name: "Admin", email: "admin@example.com", githubLogin: "admin" };

	async function call(handler: Handler, method: string, body?: unknown, auth?: "admin" | string) {
		const url = new URL("http://localhost/api/v1/newsletter");
		const request = new Request(url, {
			method,
			body: body === undefined ? undefined : JSON.stringify(body),
			headers: auth && auth !== "admin" ? { authorization: `Bearer ${auth}` } : undefined,
		});
		const response = await handler({
			url,
			request,
			locals: { admin: auth === "admin" ? admin : null },
		} as never);
		return { status: response.status, json: await response.json() };
	}

	it("subscribes through the API with the same answer for a new and a known address", async () => {
		const first = await call(subscribers.POST, "POST", { email: "ana@example.com" });
		const again = await call(subscribers.POST, "POST", { email: "ana@example.com" });

		expect(first).toEqual({ status: 202, json: { data: { status: "pending" } } });
		expect(again).toEqual(first);
		expect(outbox).toHaveLength(1);
		expect((await call(subscribers.POST, "POST", { email: "not-an-email" })).status).toBe(400);
	});

	it("confirms with the token of the e-mail and answers 404 to an unknown one", async () => {
		await subscribe(db, "ana@example.com", ORIGIN);
		const token = await tokenOf(outbox[0] as Email);

		expect((await call(confirmation.POST, "POST", { token: "unknown" })).status).toBe(404);
		expect(await statusOf("ana@example.com")).toBe("pending");
		expect((await call(confirmation.POST, "POST", { token })).status).toBe(200);
		expect(await statusOf("ana@example.com")).toBe("confirmed");
	});

	it("unsubscribes with a valid token and answers 404 to an unknown one", async () => {
		const token = await confirmed("ana@example.com");

		expect((await call(leave.POST, "POST", { token: "unknown" })).status).toBe(404);
		expect((await call(leave.POST, "POST", {})).status).toBe(400);
		expect((await call(leave.POST, "POST", { token })).status).toBe(200);
		expect(await statusOf("ana@example.com")).toBe("unsubscribed");
	});

	it("queues an announcement only for an admin and only for a post that exists", async () => {
		expect((await call(dispatches.POST, "POST", { slug: "melhor-airfryer-8-litros" })).status).toBe(401);
		expect((await call(dispatches.POST, "POST", { slug: "post-que-nao-existe" }, "admin")).status).toBe(
			404,
		);

		const queued = await call(dispatches.POST, "POST", { slug: "melhor-airfryer-8-litros" }, "admin");
		expect(queued).toEqual({
			status: 202,
			json: { data: { slug: "melhor-airfryer-8-litros", status: "pending", recipients: 0 } },
		});
	});

	it("runs the queue for an admin or the cron token, and for nobody else", async () => {
		await confirmed("ana@example.com");
		outbox.length = 0;
		await call(dispatches.POST, "POST", { slug: "melhor-airfryer-8-litros" }, "admin");

		expect((await call(run.POST, "POST")).status).toBe(401);
		expect((await call(run.GET, "GET", undefined, "wrong-secret")).status).toBe(401);
		expect((await call(run.GET, "GET", undefined, "admin")).status).toBe(401);

		const sent = await call(run.GET, "GET", undefined, "cron-secret-0123456789abcdef0123456789");
		expect(sent.json.data).toEqual([{ slug: "melhor-airfryer-8-litros", status: "sent", recipients: 1 }]);
		expect(outbox).toHaveLength(1);

		expect((await call(run.POST, "POST", undefined, "admin")).json.data).toEqual([]);
		expect(outbox).toHaveLength(1);
	});
});
