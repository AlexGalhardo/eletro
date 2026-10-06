CREATE TABLE "newsletter_delivery" (
	"dispatch_id" text NOT NULL,
	"subscriber_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_delivery_dispatch_id_subscriber_id_pk" PRIMARY KEY("dispatch_id","subscriber_id")
);
--> statement-breakpoint
ALTER TABLE "newsletter_delivery" ADD CONSTRAINT "newsletter_delivery_dispatch_id_newsletter_dispatch_id_fk" FOREIGN KEY ("dispatch_id") REFERENCES "public"."newsletter_dispatch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_delivery" ADD CONSTRAINT "newsletter_delivery_subscriber_id_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscriber"("id") ON DELETE cascade ON UPDATE no action;