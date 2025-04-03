ALTER TABLE "products" RENAME COLUMN "product_service_id" TO "services";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_product_service_id_product_services_id_fk";
