import { z } from "zod";
import { postInputSchema, productListSchema, slugSchema } from "../content/schema.ts";
import { site } from "../site.config.ts";
import { IMAGE_FOLDERS } from "./cms.ts";

type Json = Record<string, unknown>;

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const body = (schema: Json, type = "application/json") => ({
	required: true,
	content: { [type]: { schema } },
});
const ok = (description: string, schema: Json) => ({
	description,
	content: {
		"application/json": { schema: { type: "object", required: ["data"], properties: { data: schema } } },
	},
});
const failure = (description: string) => ({
	description,
	content: { "application/json": { schema: ref("Error") } },
});
const pathParam = (name: string) => ({ name, in: "path", required: true, schema: { type: "string" } });
const query = (name: string, schema: Json, description: string, required = false) => ({
	name,
	in: "query",
	required,
	description,
	schema,
});

const admin = { security: [{ session: [] }] };
const writeErrors = {
	"400": failure("Invalid request or content"),
	"401": failure("No admin session"),
	"429": failure("Too many writes from this address"),
};
const saved = (key: string) => ({
	type: "object",
	required: [key, "sha"],
	properties: { [key]: { type: "string" }, sha: { type: "string" } },
});

const status = { type: "object", required: ["status"], properties: { status: { type: "string" } } };
const dispatch = {
	type: "object",
	required: ["slug", "status", "recipients"],
	properties: { slug: { type: "string" }, status: { type: "string" }, recipients: { type: "integer" } },
};

/** Schemas come from the same zod definitions that validate the content, so the document cannot drift from them. */
const inputSchema = (schema: z.ZodType) => {
	const { $schema: _, ...rest } = z.toJSONSchema(schema, { io: "input" }) as Json;
	return rest;
};

/** The OpenAPI 3.1 description served at /api/v1/openapi.json. */
export function openApiDocument(version: string): Json {
	const postInput = inputSchema(postInputSchema);
	const products = inputSchema(productListSchema);
	const slug = inputSchema(slugSchema);

	return {
		openapi: "3.1.0",
		info: {
			title: `${site.name} API`,
			version,
			license: { name: "MIT", identifier: "MIT" },
			description:
				"Public read access to posts, categories and product lists. Writes need the session cookie of a signed-in admin.",
		},
		servers: [{ url: "/api/v1" }],
		// Public unless an operation says otherwise.
		security: [],
		paths: {
			"/health": {
				get: {
					summary: "Service status",
					responses: {
						"200": ok("The API is up", {
							type: "object",
							properties: { status: { type: "string" }, version: { type: "string" } },
						}),
					},
				},
			},
			"/posts": {
				get: {
					summary: "List published posts, newest first",
					parameters: [
						query("page", { type: "integer", minimum: 1, default: 1 }, "Page number"),
						query(
							"pageSize",
							{ type: "integer", minimum: 1, maximum: 100, default: 20 },
							"Posts per page",
						),
						query("category", { type: "string" }, "Category id"),
						query("q", { type: "string" }, "Text searched in the title and description"),
					],
					responses: {
						"200": {
							description: "A page of posts",
							content: {
								"application/json": {
									schema: {
										type: "object",
										required: ["data", "pagination"],
										properties: {
											data: { type: "array", items: ref("Post") },
											pagination: ref("Pagination"),
										},
									},
								},
							},
						},
						"400": failure("Invalid query"),
					},
				},
				post: {
					summary: "Create a post",
					...admin,
					requestBody: body({
						allOf: [
							ref("PostInput"),
							{ type: "object", required: ["slug"], properties: { slug } },
						],
					}),
					responses: {
						"201": ok("Created", saved("slug")),
						...writeErrors,
						"409": failure("A post with this slug already exists"),
					},
				},
			},
			"/posts/{slug}": {
				parameters: [pathParam("slug")],
				get: {
					summary: "A published post with its Markdown body",
					responses: {
						"200": ok("The post", {
							allOf: [
								ref("Post"),
								{ type: "object", properties: { body: { type: "string" } } },
							],
						}),
						"404": failure("Unknown, draft or scheduled post"),
					},
				},
				put: {
					summary: "Replace a post",
					...admin,
					requestBody: body({
						allOf: [
							ref("PostInput"),
							{ type: "object", required: ["sha"], properties: { sha: { type: "string" } } },
						],
					}),
					responses: {
						"200": ok("Saved", saved("slug")),
						...writeErrors,
						"404": failure("Unknown post"),
						"409": failure("The post changed since `sha`"),
					},
				},
				delete: {
					summary: "Delete a post",
					...admin,
					parameters: [query("sha", { type: "string" }, "Version being deleted", true)],
					responses: {
						"204": { description: "Deleted" },
						...writeErrors,
						"404": failure("Unknown post"),
						"409": failure("The post changed since `sha`"),
					},
				},
			},
			"/categories": {
				get: {
					summary: "Categories with the number of published posts",
					responses: {
						"200": ok("Categories", {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									label: { type: "string" },
									posts: { type: "integer" },
								},
							},
						}),
					},
				},
			},
			"/affiliate-links": {
				get: {
					summary:
						"Export of every affiliate link of the published posts, as a file the links dashboard imports",
					...admin,
					parameters: [
						{
							name: "format",
							in: "query",
							schema: { type: "string", enum: ["json", "csv"], default: "json" },
						},
					],
					responses: {
						"200": {
							description: "The file: a bare JSON array, or a CSV with one row per link",
							content: {
								"application/json": {
									schema: {
										type: "array",
										items: {
											type: "object",
											required: ["externalId", "links"],
											properties: {
												externalId: { type: "string" },
												name: { type: "string" },
												pageUrl: { type: "string" },
												category: { type: "string" },
												links: {
													type: "array",
													items: {
														type: "object",
														required: ["url", "store"],
														properties: {
															url: { type: "string" },
															store: { type: "string" },
														},
													},
												},
											},
										},
									},
								},
								"text/csv": { schema: { type: "string" } },
							},
						},
						"400": failure("Unknown format"),
						"401": failure("No admin session"),
					},
				},
			},
			"/products": {
				get: {
					summary: "Names of the product lists",
					responses: { "200": ok("List names", { type: "array", items: { type: "string" } }) },
				},
				post: {
					summary: "Create a product list",
					...admin,
					requestBody: body({
						type: "object",
						required: ["name", "products"],
						properties: { name: slug, products: ref("ProductList") },
					}),
					responses: {
						"201": ok("Created", saved("name")),
						...writeErrors,
						"409": failure("A list with this name already exists"),
					},
				},
			},
			"/products/{list}": {
				parameters: [pathParam("list")],
				get: {
					summary: "The products of a list",
					responses: {
						"200": ok("The list", {
							type: "object",
							properties: { name: { type: "string" }, products: ref("ProductList") },
						}),
						"404": failure("Unknown list"),
					},
				},
				put: {
					summary: "Replace a product list",
					...admin,
					requestBody: body({
						type: "object",
						required: ["sha", "products"],
						properties: { sha: { type: "string" }, products: ref("ProductList") },
					}),
					responses: {
						"200": ok("Saved", saved("name")),
						...writeErrors,
						"409": failure("The list changed since `sha`, or does not exist"),
					},
				},
				delete: {
					summary: "Delete a product list",
					description:
						"The posts that show the list with `<CardsTable>` lose that tag and become drafts before the list is removed.",
					...admin,
					parameters: [query("sha", { type: "string" }, "Version being deleted", true)],
					responses: {
						"204": { description: "Deleted" },
						...writeErrors,
						"404": failure("Unknown list"),
						"409": failure("The list changed since `sha`"),
					},
				},
			},
			"/media": {
				get: {
					summary: "Images of a folder",
					...admin,
					parameters: [
						query("folder", { type: "string", enum: [...IMAGE_FOLDERS] }, "Image folder", true),
					],
					responses: {
						"200": ok("Public URLs", { type: "array", items: { type: "string" } }),
						"400": failure("Invalid folder"),
						"401": failure("No admin session"),
					},
				},
				post: {
					summary: "Upload an image (WebP, JPEG or PNG, up to 4 MB)",
					...admin,
					requestBody: body(
						{
							type: "object",
							required: ["file", "folder"],
							properties: {
								file: { type: "string", format: "binary" },
								folder: { type: "string", enum: [...IMAGE_FOLDERS] },
							},
						},
						"multipart/form-data",
					),
					responses: {
						"201": ok("Stored", {
							type: "object",
							required: ["url"],
							properties: { url: { type: "string" } },
						}),
						...writeErrors,
					},
				},
			},
			"/newsletter/subscribers": {
				post: {
					summary: "Subscribe to the newsletter (double opt-in)",
					requestBody: body({
						type: "object",
						required: ["email"],
						properties: { email: { type: "string", format: "email" } },
					}),
					responses: {
						"202": ok(
							"Confirmation e-mail on its way, whatever the state of the address",
							status,
						),
						"400": failure("Invalid e-mail"),
						"429": failure("Too many requests from this address"),
					},
				},
			},
			"/newsletter/confirm": {
				post: {
					summary: "Confirm a subscription with the token of the confirmation e-mail",
					requestBody: body({
						type: "object",
						required: ["token"],
						properties: { token: { type: "string" } },
					}),
					responses: {
						"200": ok("Confirmed", status),
						"400": failure("Missing token"),
						"404": failure("Unknown token"),
						"429": failure("Too many requests from this address"),
					},
				},
			},
			"/newsletter/unsubscribe": {
				post: {
					summary: "Unsubscribe with the token of a newsletter e-mail",
					requestBody: body({
						type: "object",
						required: ["token"],
						properties: { token: { type: "string" } },
					}),
					responses: {
						"200": ok("Unsubscribed", status),
						"400": failure("Missing token"),
						"404": failure("Unknown token"),
						"429": failure("Too many requests from this address"),
					},
				},
			},
			"/newsletter/dispatches": {
				post: {
					summary: "Queue the announcement of a post to the subscribers",
					...admin,
					requestBody: body({ type: "object", required: ["slug"], properties: { slug } }),
					responses: {
						"202": ok("Queued, or already queued or sent", dispatch),
						...writeErrors,
						"404": failure("Unknown post"),
					},
				},
			},
			"/newsletter/dispatches/run": {
				post: {
					summary: "Send the queued announcements whose post is live",
					security: [{ session: [] }, { cron: [] }],
					responses: {
						"200": ok("What happened to each queued dispatch", {
							type: "array",
							items: dispatch,
						}),
						"401": failure("Neither an admin session nor the cron token"),
						"429": failure("Too many writes from this address"),
					},
				},
				get: {
					summary: "Same as POST, for schedulers that only call with GET",
					security: [{ cron: [] }],
					responses: {
						"200": ok("What happened to each queued dispatch", {
							type: "array",
							items: dispatch,
						}),
						"401": failure("Missing or wrong cron token"),
					},
				},
			},
			"/imports": {
				post: {
					summary: "Import a review post from an allowed source site as a draft",
					description: `Scrapes the page, uploads the photos of the first ${site.postImport.maxProducts} products and stores a product list and a draft post. With MISTRAL_API_KEY set, the source summary and FAQ are rewritten by Mistral. The cover is composed from three product photos. Allowed hosts: ${site.postImport.sourceHosts.join(", ")}.`,
					...admin,
					requestBody: body({
						type: "object",
						required: ["url"],
						properties: { url: { type: "string", format: "uri" } },
					}),
					responses: {
						"201": ok("Draft created", {
							type: "object",
							required: [
								"slug",
								"list",
								"products",
								"source",
								"rewritten",
								"cover",
								"warnings",
							],
							properties: {
								slug: { type: "string" },
								list: { type: "string" },
								products: { type: "integer" },
								source: { type: "string" },
								rewritten: { type: "boolean" },
								cover: { type: "string" },
								warnings: { type: "array", items: { type: "string" } },
							},
						}),
						...writeErrors,
					},
				},
			},
			"/google/sitemap": {
				post: {
					summary: "Resubmit the sitemap of the site to Google Search Console",
					description:
						"Asks Google to read /sitemap.xml again. Needs the GOOGLE_SERVICE_ACCOUNT_* and GOOGLE_SEARCH_CONSOLE_SITE variables.",
					...admin,
					responses: {
						"200": ok("Sitemap submitted", {
							type: "object",
							required: ["sitemap"],
							properties: { sitemap: { type: "string", format: "uri" } },
						}),
						"401": failure("No admin session"),
						"429": failure("Too many writes from this address"),
						"502": failure("Google refused the request or did not answer"),
						"503": failure("The Google variables are not set"),
					},
				},
			},
			"/contact": {
				post: {
					summary: "Send a message through the contact form",
					requestBody: body({
						type: "object",
						required: ["name", "email", "message"],
						properties: {
							name: { type: "string" },
							email: { type: "string", format: "email" },
							message: { type: "string", minLength: 32 },
						},
					}),
					responses: {
						"200": {
							description: "Sent",
							content: {
								"application/json": {
									schema: { type: "object", properties: { success: { type: "boolean" } } },
								},
							},
						},
						"400": failure("Invalid message"),
						"429": failure("Too many messages from this address"),
						"502": failure("The e-mail provider refused the message"),
					},
				},
			},
			"/openapi.json": {
				get: {
					summary: "This document",
					responses: {
						"200": { description: "OpenAPI 3.1 document", content: { "application/json": {} } },
					},
				},
			},
		},
		components: {
			securitySchemes: {
				session: { type: "apiKey", in: "cookie", name: "better-auth.session_token" },
				cron: { type: "http", scheme: "bearer", description: "The CRON_SECRET of the deploy" },
			},
			schemas: {
				Error: {
					type: "object",
					required: ["error"],
					properties: {
						error: {
							type: "object",
							required: ["code", "message"],
							properties: {
								code: { type: "string" },
								message: { type: "string" },
								details: { type: "array", items: { type: "string" } },
							},
						},
					},
				},
				Pagination: {
					type: "object",
					required: ["page", "pageSize", "totalItems", "totalPages"],
					properties: {
						page: { type: "integer" },
						pageSize: { type: "integer" },
						totalItems: { type: "integer" },
						totalPages: { type: "integer" },
					},
				},
				PostInput: postInput,
				Post: {
					allOf: [
						ref("PostInput"),
						{
							type: "object",
							properties: {
								slug: { type: "string" },
								readingMinutes: { type: "integer" },
								wordCount: { type: "integer" },
							},
						},
					],
				},
				ProductList: products,
			},
		},
	};
}
