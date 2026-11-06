import { IMAGE_FOLDERS, type ImageFolder, listImages } from "#lib/server/cms.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load({ url }) {
	const requested = url.searchParams.get("folder") as ImageFolder;
	const folder = IMAGE_FOLDERS.includes(requested) ? requested : "covers";
	return { folder, folders: [...IMAGE_FOLDERS], images: await listImages(getStore(), folder) };
}
