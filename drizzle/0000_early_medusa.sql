CREATE TABLE "blog_category_translations" (
	"category_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "blog_post_translations" (
	"post_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"author_bio" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_translations_post_id_locale_pk" PRIMARY KEY("post_id","locale")
);
--> statement-breakpoint
CREATE TABLE "blog_section_translations" (
	"section_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_section_translations_section_id_locale_pk" PRIMARY KEY("section_id","locale")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"product_id" uuid,
	"status" text DEFAULT 'in-process',
	"is_live" boolean,
	"tickets" integer DEFAULT 1,
	"total" numeric(10, 2) NOT NULL,
	"tour_date_id" uuid,
	"paymentMethod" text,
	"idTransaccion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_translations" (
	"faq_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "faq_translations_faq_id_locale_pk" PRIMARY KEY("faq_id","locale")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locales" (
	"code" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bank_name" text,
	"account_type" text,
	"account_number" text,
	"holder_name" text,
	"email" text,
	"payment_method" text NOT NULL,
	"blink_wallet_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_amenities_products" (
	"product_id" uuid NOT NULL,
	"product_amenity_id" uuid NOT NULL,
	CONSTRAINT "product_amenities_products_product_id_product_amenity_id_pk" PRIMARY KEY("product_id","product_amenity_id")
);
--> statement-breakpoint
CREATE TABLE "product_amenity_translations" (
	"amenity_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(155) NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_amenity_translations_amenity_id_locale_pk" PRIMARY KEY("amenity_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_category_translations" (
	"category_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(155) NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"product_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(155) NOT NULL,
	"description" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_translations_product_id_locale_pk" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_type_translations" (
	"product_type_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_type_translations_product_type_id_locale_pk" PRIMARY KEY("product_type_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"country" varchar(100) NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"images" text[] DEFAULT '{""}',
	"files" text[] DEFAULT '{""}',
	"videos" text[] DEFAULT '{""}',
	"banner" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"average_rating" numeric(8, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"target_product_audience_id" uuid NOT NULL,
	"product_category_id" uuid NOT NULL,
	"product_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"condition" text DEFAULT 'used',
	"mileage" integer NOT NULL,
	"transmission" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"pickup_location" text NOT NULL,
	"max_delivery_distance_km" integer DEFAULT 15,
	"base_delivery_fee" numeric(10, 2) DEFAULT '2.00',
	"fee_per_km" numeric(10, 2) DEFAULT '1.00',
	"offers_delivery" boolean DEFAULT false,
	"price_per_day" numeric(10, 2) NOT NULL,
	"available_from" date NOT NULL,
	"available_until" date NOT NULL,
	"is_available" boolean DEFAULT true,
	"fuel_type" text NOT NULL,
	"type_car" text NOT NULL,
	"color" text NOT NULL,
	"doors" integer NOT NULL,
	"engine" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"permissions" text[] DEFAULT '{"user"}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "target_product_audience_translations" (
	"audience_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(155) NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "target_product_audience_translations_audience_id_locale_pk" PRIMARY KEY("audience_id","locale")
);
--> statement-breakpoint
CREATE TABLE "target_product_audiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"max_people" integer NOT NULL,
	"people_booked" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_translations" (
	"product_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"departure_point" text DEFAULT '' NOT NULL,
	"difficulty" text DEFAULT '' NOT NULL,
	"highlight" text DEFAULT '' NOT NULL,
	"included" text DEFAULT '' NOT NULL,
	"itinerary" text[] DEFAULT '{}',
	"packing_list" text[] DEFAULT '{}',
	"expenses" text[] DEFAULT '{}',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tour_translations_product_id_locale_pk" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"lat" text DEFAULT '' NOT NULL,
	"long" text DEFAULT '' NOT NULL,
	"duration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image_url" text DEFAULT '',
	"bank_name" varchar(255),
	"account_number" varchar(50),
	"account_type" text DEFAULT 'Ahorro',
	"first_name" varchar(255),
	"last_name" varchar(255),
	"id_region" text,
	"country" text,
	"city" text,
	"address" text,
	"zip_code" text,
	"phone_number" varchar(50),
	"role_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_likes_user_id_post_id_unique" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reading_time_minutes" integer DEFAULT 3 NOT NULL,
	"cover_image" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"images" text[] DEFAULT '{""}',
	"videos" text[] DEFAULT '{""}',
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_category_translations" ADD CONSTRAINT "blog_category_translations_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_translations" ADD CONSTRAINT "blog_post_translations_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_section_translations" ADD CONSTRAINT "blog_section_translations_section_id_blog_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."blog_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_date_id_tour_dates_id_fk" FOREIGN KEY ("tour_date_id") REFERENCES "public"."tour_dates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq_translations" ADD CONSTRAINT "faq_translations_faq_id_faqs_id_fk" FOREIGN KEY ("faq_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_amenities" ADD CONSTRAINT "product_amenities_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_amenities_products" ADD CONSTRAINT "product_amenities_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_amenities_products" ADD CONSTRAINT "product_amenities_products_product_amenity_id_product_amenities_id_fk" FOREIGN KEY ("product_amenity_id") REFERENCES "public"."product_amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_amenity_translations" ADD CONSTRAINT "product_amenity_translations_amenity_id_product_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."product_amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category_translations" ADD CONSTRAINT "product_category_translations_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_translations" ADD CONSTRAINT "product_type_translations_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_target_product_audience_id_target_product_audiences_id_fk" FOREIGN KEY ("target_product_audience_id") REFERENCES "public"."target_product_audiences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_product_audience_translations" ADD CONSTRAINT "target_product_audience_translations_audience_id_target_product_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."target_product_audiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_dates" ADD CONSTRAINT "tour_dates_tour_id_tours_product_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_translations" ADD CONSTRAINT "tour_translations_product_id_tours_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tours"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_likes" ADD CONSTRAINT "blog_post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_likes" ADD CONSTRAINT "blog_post_likes_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_sections" ADD CONSTRAINT "blog_sections_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;

CREATE OR REPLACE FUNCTION update_product_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = (
      SELECT COALESCE(AVG(r.rating), 0)
      FROM ratings r
      WHERE r.product_id = NEW.product_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM ratings r
      WHERE r.product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para inserciones en la tabla ratings
CREATE TRIGGER rating_insert_trigger
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Trigger para actualizaciones en la tabla ratings
CREATE TRIGGER rating_update_trigger
AFTER UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Trigger para eliminaciones en la tabla ratings
CREATE TRIGGER rating_delete_trigger
AFTER DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();