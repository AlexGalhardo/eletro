import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Cuts a release from the Conventional Commits made since the last tag.
 *
 *   bun scripts/release.ts --dry-run          shows the next version and its notes, changes nothing
 *   bun scripts/release.ts                    updates CHANGELOG.md and package.json
 *   bun scripts/release.ts --version 1.0.0    forces the version (release candidates, first stable)
 *   bun scripts/release.ts --notes notes.md   also writes the notes of the version to a file
 *
 * It only edits files. Committing, tagging and publishing are done by whoever calls it
 * (.github/workflows-disabled/release.yml, or by hand following docs/ci-cd.md).
 */

export type Bump = "major" | "minor" | "patch" | null;

const RANK = { patch: 1, minor: 2, major: 3 } as const;

/** The bump a list of commit messages asks for. `content`, `docs`, `chore` and the like never release. */
export function bumpOf(messages: string[]): Bump {
	let bump: Bump = null;
	const raise = (to: Exclude<Bump, null>) => {
		if (!bump || RANK[to] > RANK[bump]) bump = to;
	};

	for (const message of messages) {
		const header = /^(\w+)(\([^)]*\))?(!)?:/.exec(message.trim());
		if (!header) continue;
		const [, type, , bang] = header;

		if (bang || /^BREAKING[ -]CHANGE:/m.test(message)) raise("major");
		else if (type === "feat") raise("minor");
		else if (type === "fix" || type === "perf") raise("patch");
	}
	return bump;
}

/** SemVer, with the usual rule for 0.x: a breaking change bumps the minor, since nothing is stable yet. */
export function nextVersion(current: string, bump: Exclude<Bump, null>): string {
	const [major = 0, minor = 0, patch = 0] = current.split("-")[0]?.split(".").map(Number) ?? [];
	const effective = major === 0 && bump === "major" ? "minor" : bump;

	if (effective === "major") return `${major + 1}.0.0`;
	if (effective === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

/**
 * Moves what is under `## [Unreleased]` to a section of the new version and fixes the compare links.
 * Returns the new file and the notes of the version (the text that goes to the GitHub Release).
 */
export function cutChangelog(
	changelog: string,
	version: string,
	date: string,
): { changelog: string; notes: string } {
	const start = changelog.indexOf("## [Unreleased]");
	if (start === -1) throw new Error('CHANGELOG.md has no "## [Unreleased]" section');

	const bodyStart = start + "## [Unreleased]".length;
	const nextSection = changelog.slice(bodyStart).search(/^## \[/m);
	const linkStart = changelog.slice(bodyStart).search(/^\[Unreleased\]:/m);
	const ends = [nextSection, linkStart].filter((index) => index !== -1);
	const bodyEnd = bodyStart + (ends.length > 0 ? Math.min(...ends) : changelog.length - bodyStart);

	const notes = changelog.slice(bodyStart, bodyEnd).trim();
	if (!notes)
		throw new Error("Nothing under [Unreleased]: add the changes to CHANGELOG.md before releasing");

	let result = `${changelog.slice(0, bodyStart)}\n\n## [${version}] - ${date}\n\n${notes}\n\n${changelog.slice(bodyEnd)}`;

	// [Unreleased]: .../compare/vOLD...HEAD  ->  compare/vNEW...HEAD, plus a link for the new version.
	result = result.replace(
		/^\[Unreleased\]: (.+)\/compare\/v(.+)\.\.\.HEAD$/m,
		(_, repo: string, previous: string) =>
			`[Unreleased]: ${repo}/compare/v${version}...HEAD\n[${version}]: ${repo}/compare/v${previous}...v${version}`,
	);
	return { changelog: result, notes };
}

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();

function main() {
	const args = process.argv.slice(2);
	const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
	const dryRun = args.includes("--dry-run");

	const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
	const lastTag = git("describe", "--tags", "--abbrev=0", "--match", "v*");
	const messages = git("log", `${lastTag}..HEAD`, "--format=%B%x00").split("\0").filter(Boolean);

	const forced = option("--version");
	const bump = bumpOf(messages);
	const output = process.env.GITHUB_OUTPUT;

	if (!forced && !bump) {
		console.log(
			`No release: no feat, fix or breaking change in ${messages.length} commit(s) since ${lastTag}.`,
		);
		if (output) appendFileSync(output, "version=\n");
		return;
	}

	const version = forced ?? nextVersion(pkg.version, bump as Exclude<Bump, null>);
	const date = new Date().toISOString().slice(0, 10);
	const { changelog, notes } = cutChangelog(readFileSync("CHANGELOG.md", "utf8"), version, date);

	console.log(
		`${pkg.version} -> ${version} (${forced ? "forced" : bump}, ${messages.length} commit(s) since ${lastTag})`,
	);
	console.log(`\n${notes}\n`);

	if (dryRun) {
		console.log("Dry run: no file was changed.");
		return;
	}

	writeFileSync("CHANGELOG.md", changelog);
	// A targeted replace keeps the formatting of package.json exactly as it is.
	writeFileSync(
		"package.json",
		readFileSync("package.json", "utf8").replace(
			`"version": "${pkg.version}"`,
			`"version": "${version}"`,
		),
	);
	const notesFile = option("--notes");
	if (notesFile) writeFileSync(notesFile, `${notes}\n`);
	if (output) appendFileSync(output, `version=${version}\n`);
}

if (import.meta.main) main();
