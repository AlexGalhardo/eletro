// Default import: the package has no "exports", so Node loads its CommonJS build, which has no named exports.
import opentype, { type PathCommand } from "opentype.js";
import sharp from "sharp";
import { INTER_BOLD_WOFF_BASE64 } from "./cover-font.ts";

export const COVER_WIDTH = 1280;
export const COVER_HEIGHT = 720;

const SLOT_WIDTH = 380;
const SLOT_HEIGHT = 440;
const SLOT_GAP = 30;
const TEXT_SIZE = 44;
const MARGIN = 40;

const font = opentype.parse(Uint8Array.from(Buffer.from(INTER_BOLD_WOFF_BASE64, "base64")).buffer);

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
 * Makes the white studio background of a product photo transparent, in place (RGBA pixels).
 * Flood fill from the border over near-white pixels, so white parts inside the product, which do not
 * touch the border, stay. Pixels on the cut get an alpha by how light they are, to soften the edge.
 * Returns the bounding box of what is left (the product), or null when nothing is.
 * ponytail: works for the plain white backgrounds of store photos; a photo with a scene or a gradient
 * behind the product keeps it. A segmentation model would be the upgrade if that becomes common.
 */
export function removeWhiteBackground(
	pixels: Uint8Array,
	width: number,
	height: number,
	threshold = 252,
): { left: number; top: number; width: number; height: number } | null {
	const lightness = (index: number) =>
		Math.min(pixels[index * 4] ?? 0, pixels[index * 4 + 1] ?? 0, pixels[index * 4 + 2] ?? 0);
	const background = new Uint8Array(width * height);
	const stack: number[] = [];
	const visit = (index: number) => {
		if (background[index] === 0 && lightness(index) >= threshold) {
			background[index] = 1;
			stack.push(index);
		}
	};
	for (let x = 0; x < width; x++) {
		visit(x);
		visit((height - 1) * width + x);
	}
	for (let y = 0; y < height; y++) {
		visit(y * width);
		visit(y * width + width - 1);
	}
	for (let index = stack.pop(); index !== undefined; index = stack.pop()) {
		const x = index % width;
		if (x > 0) visit(index - 1);
		if (x < width - 1) visit(index + 1);
		if (index >= width) visit(index - width);
		if (index < width * (height - 1)) visit(index + width);
	}

	const edgeFloor = 180;
	let minX = width;
	let minY = height;
	let maxX = -1;
	let maxY = -1;
	for (let index = 0; index < width * height; index++) {
		if (background[index]) {
			pixels[index * 4 + 3] = 0;
			continue;
		}
		const x = index % width;
		const y = (index - x) / width;
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
		const onCut =
			(x > 0 && background[index - 1]) ||
			(x < width - 1 && background[index + 1]) ||
			background[index - width] ||
			background[index + width];
		if (onCut) {
			const opacity = Math.min(1, Math.max(0, (255 - lightness(index)) / (255 - edgeFloor)));
			pixels[index * 4 + 3] = Math.round(255 * Math.max(opacity, 0.35));
		}
	}
	return maxX < 0 ? null : { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** The product alone: white background removed, cropped to the product and scaled to fit the slot. */
async function cutOut(photo: Uint8Array) {
	const { data, info } = await sharp(photo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const box = removeWhiteBackground(data, info.width, info.height);
	if (!box) throw new Error("The photo is all background.");
	const { data: png, info: size } = await sharp(data, {
		raw: { width: info.width, height: info.height, channels: 4 },
	})
		.extract(box)
		.resize(SLOT_WIDTH, SLOT_HEIGHT, { fit: "inside" })
		.png()
		.toBuffer({ resolveWithObject: true });
	return { png, width: size.width, height: size.height };
}

/**
 * Builds the post cover the way the editor used to ask an image model for it: three product photos,
 * cut out of their white background, over a light random background, with the site address in bold at
 * the bottom right. Returns a 1280x720 WebP.
 */
export async function composeCover(
	photos: Uint8Array[],
	text: string,
	random: () => number = Math.random,
): Promise<Uint8Array> {
	const chosen = pick(photos, 3, random);
	if (chosen.length === 0) throw new Error("No photo to build the cover from.");

	const rowWidth = chosen.length * SLOT_WIDTH + (chosen.length - 1) * SLOT_GAP;
	const left = (COVER_WIDTH - rowWidth) / 2;
	const top = (COVER_HEIGHT - SLOT_HEIGHT) / 2 - 30;

	const label = textPath(text, 0, 0, TEXT_SIZE);
	const textX = COVER_WIDTH - MARGIN - label.width;
	const textY = COVER_HEIGHT - MARGIN;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}">
<rect width="100%" height="100%" fill="${lightColor(random)}"/>
<path transform="translate(${textX.toFixed(1)} ${textY})" d="${label.d}" fill="#111827"/></svg>`;

	const products = await Promise.all(chosen.map(cutOut));

	// Centered in its slot, sitting on the slot floor so products of different heights line up.
	const bytes = await sharp(Buffer.from(svg))
		.composite(
			products.map((product, index) => ({
				input: product.png,
				left: Math.round(left + index * (SLOT_WIDTH + SLOT_GAP) + (SLOT_WIDTH - product.width) / 2),
				top: Math.round(top + SLOT_HEIGHT - product.height),
			})),
		)
		.webp({ quality: 82 })
		.toBuffer();
	return new Uint8Array(bytes);
}
