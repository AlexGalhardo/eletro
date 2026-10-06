import { boolean, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// --- better-auth tables (column set dictated by the library) ----------------

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	/** GitHub username, checked against ADMIN_GITHUB_USERS on every request. */
	githubLogin: text("github_login"),
	createdAt,
	updatedAt,
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt,
	updatedAt,
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
	scope: text("scope"),
	password: text("password"),
	createdAt,
	updatedAt,
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt,
	updatedAt,
});

// --- Newsletter -----------------------------------------------------------------

export const subscriber = pgTable("subscriber", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	/** pending → confirmed → unsubscribed. Only confirmed subscribers receive e-mails. */
	status: text("status", { enum: ["pending", "confirmed", "unsubscribed"] })
		.notNull()
		.default("pending"),
	/** Random secret used in the confirmation and unsubscribe links. */
	token: text("token").notNull().unique(),
	createdAt,
	confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
	unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

/** One row per post announced to subscribers. The unique slug is what prevents sending twice. */
export const newsletterDispatch = pgTable("newsletter_dispatch", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	status: text("status", { enum: ["pending", "sending", "sent", "failed"] })
		.notNull()
		.default("pending"),
	requestedBy: text("requested_by"),
	recipients: integer("recipients").notNull().default(0),
	error: text("error"),
	createdAt,
	sentAt: timestamp("sent_at", { withTimezone: true }),
});

/** One row per e-mail already sent, so a dispatch that is retried skips whoever already received it. */
export const newsletterDelivery = pgTable(
	"newsletter_delivery",
	{
		dispatchId: text("dispatch_id")
			.notNull()
			.references(() => newsletterDispatch.id, { onDelete: "cascade" }),
		subscriberId: text("subscriber_id")
			.notNull()
			.references(() => subscriber.id, { onDelete: "cascade" }),
		createdAt,
	},
	(table) => [primaryKey({ columns: [table.dispatchId, table.subscriberId] })],
);

export type Subscriber = typeof subscriber.$inferSelect;
export type NewsletterDispatch = typeof newsletterDispatch.$inferSelect;
