import { json } from "#lib/server/http.ts";
import pkg from "../../../../../package.json" with { type: "json" };

export function GET() {
	return json({ data: { status: "ok", version: pkg.version } });
}
