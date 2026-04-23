CREATE TABLE "host_profile_translations" (
	"host_profile_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"specialty" text DEFAULT '' NOT NULL,
	"experience_summary" text DEFAULT '' NOT NULL,
	"hosting_style" text DEFAULT '' NOT NULL,
	"experience_tags" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "host_profile_translations_host_profile_id_locale_pk" PRIMARY KEY("host_profile_id","locale")
);
--> statement-breakpoint
ALTER TABLE "host_profile_translations" ADD CONSTRAINT "host_profile_translations_host_profile_id_host_profiles_id_fk" FOREIGN KEY ("host_profile_id") REFERENCES "public"."host_profiles"("id") ON DELETE cascade ON UPDATE no action;