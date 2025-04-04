ALTER TABLE "bookings" ADD COLUMN "payment_link_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_url" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "qr_url" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_live" boolean;