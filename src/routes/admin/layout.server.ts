// The guard in hooks.server.ts already sent anonymous visitors to the login page.
export function load({ locals }) {
	return { admin: locals.admin };
}
