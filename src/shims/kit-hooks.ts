import type { AdminUser } from "#lib/server/auth.ts";

export type Handle = (input: {
	event: {
		url: URL;
		request: Request;
		locals: { admin: AdminUser | null };
		getClientAddress: () => string;
	};
	resolve: (
		event: unknown,
		opts?: { transformPageChunk?: (arg: { html: string }) => string },
	) => Promise<Response>;
}) => Promise<Response>;
