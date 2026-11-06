/** The handful of `@sveltejs/kit` helpers the API routes still call. */
export function json(data: unknown, init?: ResponseInit): Response {
	return Response.json(data, init);
}

export function error(status: number, message: string): never {
	const failure = new Error(message);
	failure.name = "HttpError";
	(failure as Error & { status: number }).status = status;
	throw failure;
}

export function redirect(status: number, location: string): never {
	const failure = new Error(location);
	failure.name = "Redirect";
	(failure as Error & { status: number; location: string }).status = status;
	(failure as Error & { location: string }).location = location;
	throw failure;
}
