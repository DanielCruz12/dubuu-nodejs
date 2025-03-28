ALTER TABLE "users" ALTER COLUMN "role_id" SET DEFAULT '31e73e39-521a-434d-b174-58ab49668369';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "country" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "available_dates" timestamp with time zone[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "itinerary" text[] DEFAULT '{""}';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "highlight" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "included" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_number" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_holder_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type" text DEFAULT 'Ahorro';