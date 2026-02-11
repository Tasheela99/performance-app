-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accepted_terms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accepted_terms_at" TIMESTAMPTZ(6);
