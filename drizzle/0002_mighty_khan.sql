ALTER TABLE "comments" DROP CONSTRAINT "comments_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "faqs" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "faqs" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product_services" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_services" ADD CONSTRAINT "product_services_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "faqs" DROP COLUMN "category";