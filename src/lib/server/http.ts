/** JSON and control-flow responses shared by the API handlers. */
export function json(data: unknown, init?: ResponseInit): Response {
	return Response.json(data, init);
}

export function error(status: number, message: string): never {
	const failure = new Error(message) as Error & { status: number };
	failure.name = "HttpError";
	failure.status = status;
	throw failure;
}

export function redirect(status: number, location: string): never {
	const failure = new Error(location) as Error & { status: number; location: string };
	failure.name = "Redirect";
	failure.status = status;
	failure.location = location;
	throw failure;
}
