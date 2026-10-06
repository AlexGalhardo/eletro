/** Widths of the resized copies of each cover made at build time (see `scripts/cover-variants.ts`). */
// 480 and 768 cover a phone at 1x and 2x; 1280 covers the post page on a desktop.
export const COVER_WIDTHS = [480, 768, 1280] as const;

/** Where the copy of a cover at a given width lives, or `undefined` for a cover that is not a local file. */
export function coverVariant(cover: string, width: number): string | undefined {
	const match = /^\/images\/covers\/([^/]+)\.(?:webp|jpe?g|png)$/i.exec(cover);
	return match ? `/images/covers/w${width}/${match[1]}.webp` : undefined;
}

/** The widths at which a copy of the cover exists: a small original has no larger copy, and development has none. */
export const coverWidths = (cover: string, exists: (url: string) => boolean): number[] =>
	COVER_WIDTHS.filter((width) => {
		const url = coverVariant(cover, width);
		return url !== undefined && exists(url);
	});

/** The `srcset` for those widths. `undefined` means "use the original alone". */
export function coverSrcset(cover: string, widths: readonly number[]): string | undefined {
	const sources = widths.flatMap((width) => {
		const url = coverVariant(cover, width);
		return url ? [`${url} ${width}w`] : [];
	});
	return sources.length > 0 ? sources.join(", ") : undefined;
}
