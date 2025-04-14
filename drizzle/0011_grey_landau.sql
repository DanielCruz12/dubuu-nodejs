CREATE TABLE "tour_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"max_people" integer NOT NULL,
	"people_booked" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "tour_date_id" uuid;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "lat" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "long" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_dates" ADD CONSTRAINT "tour_dates_tour_id_tours_product_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_date_id_tour_dates_id_fk" FOREIGN KEY ("tour_date_id") REFERENCES "public"."tour_dates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "selected_dates";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "available_dates";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "max_people";