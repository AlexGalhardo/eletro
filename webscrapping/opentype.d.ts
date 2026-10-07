// opentype.js 2.0.0 ships no types and @types/opentype.js describes 1.x. Only what cover.ts uses.
declare module "opentype.js" {
	export type PathCommand = {
		type: "M" | "L" | "C" | "Q" | "Z";
		x?: number;
		y?: number;
		x1?: number;
		y1?: number;
		x2?: number;
		y2?: number;
	};
	export type Glyph = {
		advanceWidth?: number;
		getPath(x: number, y: number, fontSize: number): { commands: PathCommand[] };
	};
	export type Font = { unitsPerEm: number; charToGlyph(char: string): Glyph };
	const opentype: { parse(buffer: ArrayBuffer): Font };
	export default opentype;
}
