// Renders static/icon.svg into the PNG sizes browsers and phones ask for. Run after editing the SVG.
import path from "node:path";
import sharp from "sharp";

const root = path.join(import.meta.dirname, "..", "static");
const sizes = { "apple-touch-icon.png": 180, "icon-192.png": 192, "icon-512.png": 512 };

for (const [file, size] of Object.entries(sizes)) {
	await sharp(path.join(root, "icon.svg"), { density: 384 })
		.resize(size, size)
		.png()
		.toFile(path.join(root, file));
}
