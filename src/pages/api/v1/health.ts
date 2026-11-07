import type { APIRoute } from "astro";
import { GET as handler } from "../../../routes/api/v1/health/server.ts";

// `publishJsonForPages` moves this output to `health/index.json`. GitHub Pages serves
// that file for `/api/v1/health/` as application/json. The bare path 301s there.
export const GET: APIRoute = () => handler();
