import type { APIRoute } from "astro";
import { GET as handler } from "../routes/robots.txt/server.ts";

export const GET: APIRoute = () => handler();
