import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { publishJsonForPages } from "./pages-output.ts";

describe("publishJsonForPages", () => {
	it("writes index.json where GitHub Pages will serve application/json", async () => {
		const root = await mkdtemp(path.join(tmpdir(), "pages-json-"));
		const api = path.join(root, "api", "v1");
		await mkdir(path.join(api, "posts"), { recursive: true });
		await writeFile(path.join(api, "health"), '{"data":{"status":"ok"}}');
		await writeFile(path.join(api, "posts", "index.html"), '{"data":[]}');
		await writeFile(path.join(api, "posts", "airfryer"), '{"data":{"slug":"airfryer"}}');
		await writeFile(path.join(api, "openapi.json"), '{"openapi":"3.1.0"}');

		await publishJsonForPages(path.join(root, "api"));

		expect(JSON.parse(await readFile(path.join(api, "health", "index.json"), "utf8"))).toEqual({
			data: { status: "ok" },
		});
		expect(JSON.parse(await readFile(path.join(api, "posts", "index.json"), "utf8"))).toEqual({
			data: [],
		});
		expect(JSON.parse(await readFile(path.join(api, "posts", "airfryer", "index.json"), "utf8"))).toEqual(
			{
				data: { slug: "airfryer" },
			},
		);
		expect(JSON.parse(await readFile(path.join(api, "openapi.json"), "utf8"))).toEqual({
			openapi: "3.1.0",
		});
		await expect(readFile(path.join(api, "health"), "utf8")).rejects.toThrow();
		await expect(readFile(path.join(api, "posts", "index.html"), "utf8")).rejects.toThrow();
	});
});
