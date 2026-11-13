import { afterEach, expect, test, vi } from "vitest";
import { decodeFile, GithubError, PagesRepository } from "./github-pages.ts";

afterEach(() => vi.unstubAllGlobals());

test("saves UTF-8 text to the selected repository with a version SHA", async () => {
	const fetcher = vi
		.fn()
		.mockResolvedValueOnce(new Response('{"object":{"sha":"main-sha"}}'))
		.mockResolvedValueOnce(new Response("{}"))
		.mockResolvedValueOnce(new Response("{}"))
		.mockResolvedValueOnce(new Response('{"html_url":"https://github.com/owner/blog/pull/1"}'));
	vi.stubGlobal("fetch", fetcher);
	const repository = new PagesRepository("owner/blog", "secret-token");
	await repository.save("content/posts/cafe.mdx", "Café ☕", "old-sha");
	const [url, init] = fetcher.mock.calls[2] as [string, RequestInit];
	expect(url).toBe("https://api.github.com/repos/owner/blog/contents/content/posts/cafe.mdx");
	expect(new Headers(init.headers).get("Authorization")).toBe("Bearer secret-token");
	const body = String(init.body);
	expect(JSON.parse(body)).toMatchObject({
		sha: "old-sha",
		branch: expect.stringMatching(/^cms\/edit-/),
		message: "content: update content/posts/cafe.mdx",
	});
	expect(decodeFile(JSON.parse(body).content)).toBe("Café ☕");
	expect(repository.reviewUrl).toBe("https://github.com/owner/blog/pull/1");
});

test("a conflicting save reports the conflict instead of overwriting", async () => {
	vi.stubGlobal(
		"fetch",
		vi
			.fn()
			.mockResolvedValueOnce(new Response('{"object":{"sha":"main-sha"}}'))
			.mockResolvedValueOnce(new Response("{}"))
			.mockResolvedValueOnce(new Response("{}", { status: 409 })),
	);
	await expect(
		new PagesRepository("owner/blog", "token").save("content/flags.json", "{}", "old"),
	).rejects.toBeInstanceOf(GithubError);
});
