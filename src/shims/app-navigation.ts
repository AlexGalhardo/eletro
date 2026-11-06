/** Stand-in for `$app/navigation`. The public site is a static multipage build. */
export function goto(href: string): void {
	if (typeof window !== "undefined") window.location.assign(href);
}

export function invalidateAll(): void {
	if (typeof window !== "undefined") window.location.reload();
}
