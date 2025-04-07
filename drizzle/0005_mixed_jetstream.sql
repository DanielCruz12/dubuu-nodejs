ALTER TABLE "bookings" ALTER COLUMN "total" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total" SET NOT NULL;