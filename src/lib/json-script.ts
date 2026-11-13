/** JSON safe to drop inside a script tag: `<` cannot close the element. */
export function jsonForScript(value: unknown): string {
	return JSON.stringify(value).replaceAll("<", "\\u003c");
}
