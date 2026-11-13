import { json } from "#lib/server/http.ts";
import { openApiDocument } from "#lib/server/openapi.ts";
import pkg from "../../../../../package.json" with { type: "json" };

export function GET() {
	return json(openApiDocument(pkg.version));
}
