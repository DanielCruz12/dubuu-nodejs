ALTER TABLE "tours" ADD COLUMN "expenses" text[] DEFAULT '{""}';--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "difficulty" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "packing_list" text[] DEFAULT '{""}';