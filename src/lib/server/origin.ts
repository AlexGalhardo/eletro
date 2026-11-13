import { site } from "../site.config.ts";

const dev = import.meta.env.DEV;

/**
 * Origin used in links sent by e-mail. In production it is always the configured site URL,
 * never the Host header of the request, which the sender of the request controls.
 */
export const linkOrigin = (url: URL): string => (dev ? url.origin : site.url);
