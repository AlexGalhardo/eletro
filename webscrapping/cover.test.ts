import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
	COVER_HEIGHT,
	COVER_WIDTH,
	composeCover,
	lightColor,
	pick,
	removeWhiteBackground,
	textPath,
} from "./cover.ts";

const photo = async (background: string) =>
	new Uint8Array(
		await sharp({ create: { width: 40, height: 30, channels: 3, background } })
			.png()
			.toBuffer(),
	);

describe("cover", () => {
	it("composes a 1280x720 WebP from the photos", async () => {
		const photos = await Promise.all(["#f00", "#0f0", "#00f", "#000"].map(photo));
		const cover = await composeCover(photos, "eletroradar", () => 0.5);
		expect(await sharp(cover).metadata()).toMatchObject({
			format: "webp",
			width: COVER_WIDTH,
			height: COVER_HEIGHT,
		});
	});

	it("draws every letter of the text as valid path data", () => {
		const { d, width } = textPath("Radar.com.br", 0, 0, 40);
		// opentype.js 2.0 writes "12.6 0" as "12.60", which ends the path early in librsvg.
		const arity: Record<string, number> = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };
		for (const [command, letter = "", args = ""] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g))
			expect(args.match(/-?\d+(\.\d+)?/g)?.length ?? 0, command).toBe(arity[letter]);
		expect(width).toBeGreaterThan(200);
	});

	it("picks distinct items and light colors", () => {
		expect(new Set(pick([1, 2, 3, 4, 5, 6, 7], 3)).size).toBe(3);
		expect(pick([1, 2], 3)).toHaveLength(2);
		for (const value of [0, 0.5, 0.999])
			expect(lightColor(() => value)).toMatch(/^hsl\(\d+, \d+%, (8[6-9]|9[0-2])%\)$/);
	});

	it("removes the white background but keeps white parts enclosed by the product", () => {
		// 10x10 white photo; a dark ring from (2,2) to (7,7) with a white hole at (4,4)-(5,5).
		const size = 10;
		const pixels = new Uint8Array(size * size * 4).fill(255);
		for (let y = 2; y <= 7; y++)
			for (let x = 2; x <= 7; x++)
				if (x < 4 || x > 5 || y < 4 || y > 5)
					pixels.fill(20, (y * size + x) * 4, (y * size + x) * 4 + 3);

		const box = removeWhiteBackground(pixels, size, size);

		const alpha = (x: number, y: number) => pixels[(y * size + x) * 4 + 3];
		expect(box).toEqual({ left: 2, top: 2, width: 6, height: 6 });
		expect(alpha(0, 0)).toBe(0);
		expect(alpha(9, 5)).toBe(0);
		expect(alpha(4, 4)).toBe(255);
		expect(alpha(3, 3)).toBe(255);
		expect(removeWhiteBackground(new Uint8Array(16).fill(255), 2, 2)).toBeNull();
	});

	it("refuses an empty photo list", async () => {
		await expect(composeCover([], "x")).rejects.toThrow();
	});
});
