import { listPosts } from "#lib/server/cms.ts";
import { getBundledPostSources } from "#lib/server/content.ts";
import { isPostDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const posts = await listPosts(getStore(), getBundledPostSources());
	return { posts: posts.map((post) => ({ ...post, deployed: isPostDeployed(post.slug, post.sha) })) };
}
