CREATE TABLE "demo_creation_limit" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_identity_metadata" (
	"user_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_session_grant" (
	"session_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_identity_metadata" ADD CONSTRAINT "demo_identity_metadata_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_session_grant" ADD CONSTRAINT "demo_session_grant_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_session_grant" ADD CONSTRAINT "demo_session_grant_user_id_demo_identity_metadata_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."demo_identity_metadata"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demo_limit_reset_idx" ON "demo_creation_limit" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "demo_expiration_idx" ON "demo_identity_metadata" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "demo_grant_user_idx" ON "demo_session_grant" USING btree ("user_id");