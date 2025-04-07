ALTER TABLE "bookings" ADD COLUMN "tickets" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "id_region" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "paymentMethod" text;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "payment_link_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "payment_url";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "qr_url";