-- Add Blink payment support: blink_wallet_address and optional bank fields
ALTER TABLE "payment_accounts" ADD COLUMN IF NOT EXISTS "blink_wallet_address" text;

ALTER TABLE "payment_accounts" ALTER COLUMN "bank_name" DROP NOT NULL;
ALTER TABLE "payment_accounts" ALTER COLUMN "account_type" DROP NOT NULL;
ALTER TABLE "payment_accounts" ALTER COLUMN "account_number" DROP NOT NULL;
ALTER TABLE "payment_accounts" ALTER COLUMN "holder_name" DROP NOT NULL;
ALTER TABLE "payment_accounts" ALTER COLUMN "email" DROP NOT NULL;
