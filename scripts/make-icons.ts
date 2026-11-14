// Renders static/icon.svg into the PNG sizes browsers and phones ask for. Run after editing the SVG.
// The icons stay transparent; iOS does not accept transparency, so the apple-touch-icon gets the paper background.
import path from "node:path";
import sharp from "sharp";

const root = path.join(import.meta.dirname, "..", "static");
const paper = "#f5f4f0";
const sizes = [
	{ file: "apple-touch-icon.png", size: 180, background: paper },
	{ file: "icon-192.png", size: 192 },
	{ file: "icon-512.png", size: 512 },
];

for (const { file, size, background } of sizes) {
	let image = sharp(path.join(root, "icon.svg"), { density: 384 }).resize(size, size);
	if (background) image = image.flatten({ background });
	await image.png().toFile(path.join(root, file));
}
