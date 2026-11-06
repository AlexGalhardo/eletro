import type { APIRoute } from "astro";
import { GET as handler } from "../../../routes/api/v1/openapi.json/server.ts";

export const GET: APIRoute = () => handler();
