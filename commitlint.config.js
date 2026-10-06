export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// `content` is used by the admin dashboard for post/product commits; it never triggers a release.
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"docs",
				"style",
				"refactor",
				"perf",
				"test",
				"build",
				"ci",
				"chore",
				"revert",
				"content",
			],
		],
	},
};
