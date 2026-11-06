import type { APIRoute } from "astro";
import { GET as handler } from "../routes/sitemap.xml/server.ts";

export const GET: APIRoute = () => handler();
