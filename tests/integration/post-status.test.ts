import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { POST_STATUS_FILE, renderPostStatus } from "../../scripts/post-status.ts";

it("docs/post-status.md matches the content (run `bun run post-status` to update it)", () => {
	expect(readFileSync(POST_STATUS_FILE, "utf8")).toBe(renderPostStatus());
});
