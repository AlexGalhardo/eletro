// Runs first in every build: refuses a production build with an essential variable missing, and any build
// with a variable that is present but malformed. Only names are printed, never values.
import { envProblems } from "../src/lib/env-check.ts";

// The same condition scripts/sync-links.ts uses: previews, Docker, tests and local builds need no variable.
const production = process.env.VERCEL_ENV === "production";
const problems = envProblems(process.env, production);

if (problems.length) {
	console.error(
		`Variáveis de ambiente inválidas${production ? " para o build de produção" : ""} ` +
			`(${problems.length}):\n- ${problems.join("\n- ")}`,
	);
	process.exit(1);
}

console.log(`Variáveis de ambiente conferidas${production ? " (build de produção)" : ""}.`);
