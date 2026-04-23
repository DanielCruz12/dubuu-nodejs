INSERT INTO "host_profile_translations" (
  "host_profile_id",
  "locale",
  "intro",
  "description",
  "specialty",
  "experience_summary",
  "hosting_style",
  "experience_tags",
  "updated_at"
)
SELECT
  hp."id" AS "host_profile_id",
  'es' AS "locale",
  hp."intro",
  hp."description",
  hp."specialty",
  hp."experience_summary",
  hp."hosting_style",
  hp."experience_tags",
  now() AS "updated_at"
FROM "host_profiles" hp
ON CONFLICT ("host_profile_id", "locale") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "intro";--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "specialty";--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "experience_summary";--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "hosting_style";--> statement-breakpoint
ALTER TABLE "host_profiles" DROP COLUMN "experience_tags";