import type { APIRoute } from "astro";
import { GET as handler } from "../../../routes/api/v1/categories/server.ts";

export const GET: APIRoute = () => handler();
