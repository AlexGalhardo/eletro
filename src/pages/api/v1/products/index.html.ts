import type { APIRoute } from "astro";
import { GET as handler } from "../../../../routes/api/v1/products/server.ts";

// Same directory index as the posts collection, renamed to `index.json` after the build.
export const GET: APIRoute = () => handler();
