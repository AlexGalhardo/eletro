import { describe, expect, it } from "vitest";
import { bumpOf, cutChangelog, nextVersion, sectionOf } from "../../scripts/release.ts";

describe("bumpOf", () => {
	it("asks for a bump only for feat, fix, perf and breaking changes", () => {
		expect(
			bumpOf(["content: add post x", "docs: update readme", "chore: tidy", "test: cover y"]),
		).toBeNull();
		expect(bumpOf(["fix: broken link", "docs: readme"])).toBe("patch");
		expect(bumpOf(["perf(images): lazy load"])).toBe("patch");
		expect(bumpOf(["fix: a", "feat(admin): b", "fix: c"])).toBe("minor");
		expect(bumpOf(["feat!: drop the old API"])).toBe("major");
		expect(bumpOf(["refactor: move files\n\nBREAKING CHANGE: the import path changed"])).toBe("major");
		expect(bumpOf(["not a conventional commit", "feature: looks like feat but is not"])).toBeNull();
	});
});

describe("nextVersion", () => {
	it("follows SemVer, and keeps breaking changes in the minor before 1.0", () => {
		expect(nextVersion("0.1.0", "patch")).toBe("0.1.1");
		expect(nextVersion("0.1.3", "minor")).toBe("0.2.0");
		expect(nextVersion("0.9.2", "major")).toBe("0.10.0");
		expect(nextVersion("1.4.2", "major")).toBe("2.0.0");
		expect(nextVersion("1.4.2", "minor")).toBe("1.5.0");
	});

	it("only counts up while the version is a pre-release", () => {
		expect(nextVersion("1.0.0-rc.1", "patch")).toBe("1.0.0-rc.2");
		expect(nextVersion("1.0.0-rc.9", "minor")).toBe("1.0.0-rc.10");
		expect(nextVersion("2.0.0-beta.3", "major")).toBe("2.0.0-beta.4");
	});
});

describe("cutChangelog", () => {
	const repo = "https://github.com/owner/repo";
	const changelog = [
		"# Changelog",
		"",
		"## [Unreleased]",
		"",
		"### Added",
		"",
		"- New thing.",
		"",
		"## [0.1.0] - 2026-10-06",
		"",
		"- First version.",
		"",
		`[Unreleased]: ${repo}/compare/v0.1.0...HEAD`,
		`[0.1.0]: ${repo}/releases/tag/v0.1.0`,
		"",
	].join("\n");

	it("moves the unreleased notes to the new version and updates the links", () => {
		const result = cutChangelog(changelog, "0.2.0", "2026-10-07");

		expect(result.notes).toBe("### Added\n\n- New thing.");
		expect(result.changelog).toBe(
			[
				"# Changelog",
				"",
				"## [Unreleased]",
				"",
				"## [0.2.0] - 2026-10-07",
				"",
				"### Added",
				"",
				"- New thing.",
				"",
				"## [0.1.0] - 2026-10-06",
				"",
				"- First version.",
				"",
				`[Unreleased]: ${repo}/compare/v0.2.0...HEAD`,
				`[0.2.0]: ${repo}/compare/v0.1.0...v0.2.0`,
				`[0.1.0]: ${repo}/releases/tag/v0.1.0`,
				"",
			].join("\n"),
		);
	});

	it("uses the commit subject when nothing was written under Unreleased", () => {
		const empty = changelog.replace("### Added\n\n- New thing.\n\n", "");
		const result = cutChangelog(empty, "0.1.1", "2026-10-07", "docs: fix a typo");

		expect(result.notes).toBe("- docs: fix a typo");
		expect(result.changelog).toContain("## [0.1.1] - 2026-10-07\n\n- docs: fix a typo\n\n## [0.1.0]");
	});

	it("returns the notes of one version", () => {
		const { changelog: cut } = cutChangelog(changelog, "0.2.0", "2026-10-07");

		expect(sectionOf(cut, "0.2.0")).toBe("### Added\n\n- New thing.");
		expect(sectionOf(cut, "0.1.0")).toBe("- First version.");
		expect(() => sectionOf(cut, "9.9.9")).toThrow("no section for 9.9.9");
	});

	it("refuses to release with nothing written under Unreleased and no commit subject", () => {
		const empty = changelog.replace("### Added\n\n- New thing.\n\n", "");

		expect(() => cutChangelog(empty, "0.2.0", "2026-10-07")).toThrow("Nothing under [Unreleased]");
		expect(() => cutChangelog("# Changelog\n", "0.2.0", "2026-10-07")).toThrow(
			'no "## [Unreleased]" section',
		);
	});
});
