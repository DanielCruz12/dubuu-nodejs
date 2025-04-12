ALTER TABLE "users" ADD COLUMN "id_region" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "id_region";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "account_holder_name";