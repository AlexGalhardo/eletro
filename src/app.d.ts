import type { AdminUser } from "#lib/server/auth.ts";

declare global {
	namespace App {
		interface Locals {
			/** The signed-in admin, or `null`. Only resolved for /admin and /api requests. */
			admin: AdminUser | null;
		}
	}
}
