import { type PathCommand, parse } from "opentype.js";
import sharp from "sharp";
import { INTER_BOLD_WOFF_BASE64 } from "./cover-font.ts";

export const COVER_WIDTH = 1280;
export const COVER_HEIGHT = 720;

const CARD = 360;
const CARD_GAP = 48;
const CARD_PADDING = 24;
const TEXT_SIZE = 44;
const MARGIN = 40;

const font = parse(Uint8Array.from(Buffer.from(INTER_BOLD_WOFF_BASE64, "base64")).buffer);

/**
 * SVG path of `text` in Inter Bold. The text becomes outlines, so rendering needs no installed font
 * (serverless functions have none). Glyph by glyph: opentype.js 2.0 fails on Inter's contextual
 * substitutions, and a domain name needs neither ligatures nor kerning. The path data is written here
 * because its own `toPathData` glues a -0 coordinate to the previous number ("12.6 0" becomes "12.60").
 */
export function textPath(text: string, x: number, baseline: number, size: number) {
	let cursor = x;
	let d = "";
	for (const char of text) {
		const glyph = font.charToGlyph(char);
		d += glyph.getPath(cursor, baseline, size).commands.map(pathCommand).join("");
		cursor += ((glyph.advanceWidth ?? 0) * size) / font.unitsPerEm;
	}
	return { d, width: cursor - x };
}

const n = (value = 0) => (Math.round(value * 10) / 10 || 0).toString();

function pathCommand(c: PathCommand): string {
	if (c.type === "Z") return "Z";
	if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
	if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
	return `${c.type}${n(c.x)} ${n(c.y)}`;
}

/** A random light pastel: any hue, high lightness, so dark text and product photos stay readable. */
export function lightColor(random: () => number = Math.random): string {
	const hue = Math.floor(random() * 360);
	const saturation = 55 + Math.floor(random() * 30);
	const lightness = 86 + Math.floor(random() * 7);
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/** Up to `count` distinct items, in random order. */
export function pick<T>(items: readonly T[], count: number, random: () => number = Math.random): T[] {
	const pool = [...items];
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[pool[i], pool[j]] = [pool[j] as T, pool[i] as T];
	}
	return pool.slice(0, count);
}

/**
 * Builds the post cover the way the editor used to ask an image model for it: three product photos on
 * white cards over a light random background, with the site address in bold at the bottom right.
 * Returns a 1280x720 WebP.
 */
export async function composeCover(
	photos: Uint8Array[],
	text: string,
	random: () => number = Math.random,
): Promise<Uint8Array> {
	const chosen = pick(photos, 3, random);
	if (chosen.length === 0) throw new Error("No photo to build the cover from.");

	const rowWidth = chosen.length * CARD + (chosen.length - 1) * CARD_GAP;
	const left = (COVER_WIDTH - rowWidth) / 2;
	const top = (COVER_HEIGHT - CARD) / 2 - 30;
	const inner = CARD - CARD_PADDING * 2;

	const cards = chosen
		.map(
			(_, index) =>
				`<rect x="${left + index * (CARD + CARD_GAP)}" y="${top}" width="${CARD}" height="${CARD}" rx="28" fill="#ffffff"/>`,
		)
		.join("");
	const label = textPath(text, 0, 0, TEXT_SIZE);
	const textX = COVER_WIDTH - MARGIN - label.width;
	const textY = COVER_HEIGHT - MARGIN;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}">
<rect width="100%" height="100%" fill="${lightColor(random)}"/>${cards}
<path transform="translate(${textX.toFixed(1)} ${textY})" d="${label.d}" fill="#111827"/></svg>`;

	const images = await Promise.all(
		chosen.map((photo) =>
			sharp(photo)
				.resize(inner, inner, { fit: "contain", background: "#ffffff" })
				.flatten({ background: "#ffffff" })
				.toBuffer(),
		),
	);

	const bytes = await sharp(Buffer.from(svg))
		.composite(
			images.map((input, index) => ({
				input,
				left: Math.round(left + index * (CARD + CARD_GAP) + CARD_PADDING),
				top: Math.round(top + CARD_PADDING),
			})),
		)
		.webp({ quality: 82 })
		.toBuffer();
	return new Uint8Array(bytes);
}
