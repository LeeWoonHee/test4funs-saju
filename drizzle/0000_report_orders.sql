CREATE TYPE "public"."report_order_status" AS ENUM('queued', 'generating', 'failed', 'ready', 'refund_pending', 'refunded', 'deleted');--> statement-breakpoint
CREATE TABLE "report_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text NOT NULL,
	"status" "report_order_status" NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_limits" (
	"window" integer PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_access" (
	"order_id" text PRIMARY KEY NOT NULL,
	"session_hash" text NOT NULL,
	"recovery_hash" text NOT NULL,
	"snapshot" jsonb,
	"report" jsonb
);
--> statement-breakpoint
ALTER TABLE "report_access" ADD CONSTRAINT "report_access_order_id_report_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."report_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_session_hash" ON "report_access" USING btree ("session_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "report_recovery_hash" ON "report_access" USING btree ("recovery_hash");