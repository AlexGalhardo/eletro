import type { APIRoute } from "astro";
import { GET as handler } from "../../../../routes/api/v1/posts/server.ts";

// A file named `posts` cannot sit next to `posts/<slug>` on disk. The build renames this
// directory index to `index.json`, which GitHub Pages serves for `/api/v1/posts/` as JSON.
export const GET: APIRoute = ({ url }) => handler({ url });
