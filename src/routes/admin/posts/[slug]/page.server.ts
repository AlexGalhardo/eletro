import { getPost, listImages, listProductLists, ValidationError } from "#lib/server/cms.ts";
import { isPostDeployed } from "#lib/server/deploy.ts";
import { error } from "#lib/server/http.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load({ params }) {
	const store = getStore();
	const [entry, lists, covers] = await Promise.all([
		getPost(store, params.slug).catch((cause: unknown) => {
			if (cause instanceof ValidationError) error(404, "Post não encontrado");
			// ponytail: a post whose frontmatter no longer parses cannot be opened in the form; fix the file in the repository.
			error(422, cause instanceof Error ? cause.message : "Post inválido");
		}),
		listProductLists(store),
		listImages(store, "covers"),
	]);
	if (!entry) error(404, "Post não encontrado");

	const { slug, readingMinutes, wordCount, ...frontmatter } = entry.post;
	return {
		kind: store.kind,
		slug,
		sha: entry.sha,
		post: { ...frontmatter, body: entry.body },
		deployed: isPostDeployed(slug, entry.sha),
		lists: lists.map((list) => list.name),
		covers,
	};
}
