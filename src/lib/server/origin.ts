import { dev } from "$app/env";
import { site } from "../site.config.ts";

/**
 * Origin used in links sent by e-mail. In production it is always the configured site URL,
 * never the Host header of the request, which the sender of the request controls.
 */
export const linkOrigin = (url: URL): string => (dev ? url.origin : site.url);
