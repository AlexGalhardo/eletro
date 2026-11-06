import type { APIRoute } from "astro";
import { GET as handler } from "../../../../routes/api/v1/posts/server.ts";

// A file named `posts` cannot sit next to `posts/<slug>` on disk. `index.html` is the
// directory index GitHub Pages serves for `/api/v1/posts`.
export const GET: APIRoute = ({ url }) => handler({ url });
