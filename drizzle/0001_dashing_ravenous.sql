ALTER TABLE "users" ALTER COLUMN "role_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role_id" DROP NOT NULL;