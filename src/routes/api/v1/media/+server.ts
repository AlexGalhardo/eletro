import { json } from "@sveltejs/kit";
import { z } from "zod";
import { parseQuery, requireAdmin, respond } from "#lib/server/api.ts";
import { IMAGE_FOLDERS, listImages, MAX_IMAGE_BYTES, uploadImage, ValidationError } from "#lib/server/cms.ts";
import { getStore } from "#lib/server/store/index.ts";

const querySchema = z.object({ folder: z.enum(IMAGE_FOLDERS) });

/** Public URLs of the images in a folder, read from the store so fresh uploads show up before the next deploy. */
export function GET({ url, locals }) {
	return respond(async () => {
		requireAdmin(locals);
		const { folder } = parseQuery(querySchema, url);

		return json({ data: await listImages(getStore(), folder) });
	});
}

/** Multipart upload with the fields `file` and `folder`. */
export function POST({ request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);

		const form = await request.formData().catch(() => null);
		const file = form?.get("file");
		if (!(file instanceof File)) throw new ValidationError(["Envie o arquivo no campo file."]);
		// Checked before the bytes are read, so an oversized upload is not buffered twice.
		if (file.size > MAX_IMAGE_BYTES) throw new ValidationError(["A imagem passa de 4 MB."]);

		const uploaded = await uploadImage(
			getStore(),
			{
				folder: String(form?.get("folder") ?? ""),
				filename: file.name,
				type: file.type,
				bytes: new Uint8Array(await file.arrayBuffer()),
			},
			author,
		);
		return json({ data: uploaded }, { status: 201 });
	});
}
