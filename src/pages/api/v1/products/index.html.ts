import type { APIRoute } from "astro";
import { GET as handler } from "../../../../routes/api/v1/products/server.ts";

// Same directory-index layout as the posts collection. See `posts/index.html.ts`.
export const GET: APIRoute = () => handler();
