CREATE TABLE "applications" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"position" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY,
	"position" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "download_tokens" (
	"token" text PRIMARY KEY,
	"expires_at" bigint NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY,
	"app_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"user_id" text,
	"app_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlists_pkey" PRIMARY KEY("user_id","app_id")
);
--> statement-breakpoint
CREATE INDEX "entitlements_user_id_idx" ON "entitlements" ("user_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_app_id_idx" ON "reviews" ("app_id");