/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "appraisal_reviews" ALTER COLUMN "performance_classification" SET DEFAULT 'NEEDS_CRITICAL_IMPROVEMENT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_token" VARCHAR(255),
ADD COLUMN     "verification_token_expiry" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE INDEX "users_verification_token_idx" ON "users"("verification_token");
