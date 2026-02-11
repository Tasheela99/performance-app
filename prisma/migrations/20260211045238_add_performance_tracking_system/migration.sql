/*
  Warnings:

  - Added the required column `performance_classification` to the `appraisal_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PerformanceSection" AS ENUM ('tasks', 'competencies');

-- AlterTable
ALTER TABLE "appraisal_reviews" ADD COLUMN     "competency_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "performance_classification" VARCHAR(100) NOT NULL,
ADD COLUMN     "task_score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "section" "PerformanceSection" NOT NULL DEFAULT 'tasks';

-- CreateTable
CREATE TABLE "officer_performance_tracking" (
    "id" UUID NOT NULL,
    "officer_id" UUID NOT NULL,
    "consecutive_excellent_years" INTEGER NOT NULL DEFAULT 0,
    "total_increments" INTEGER NOT NULL DEFAULT 0,
    "eligible_for_presidential_award" BOOLEAN NOT NULL DEFAULT false,
    "last_excellent_year" VARCHAR(10),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "officer_performance_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "officer_performance_tracking_officer_id_key" ON "officer_performance_tracking"("officer_id");

-- CreateIndex
CREATE INDEX "officer_performance_tracking_officer_id_idx" ON "officer_performance_tracking"("officer_id");

-- CreateIndex
CREATE INDEX "officer_performance_tracking_consecutive_excellent_years_idx" ON "officer_performance_tracking"("consecutive_excellent_years");

-- CreateIndex
CREATE INDEX "officer_performance_tracking_eligible_for_presidential_awar_idx" ON "officer_performance_tracking"("eligible_for_presidential_award");

-- CreateIndex
CREATE INDEX "appraisal_reviews_overall_score_idx" ON "appraisal_reviews"("overall_score");

-- CreateIndex
CREATE INDEX "appraisal_reviews_performance_classification_idx" ON "appraisal_reviews"("performance_classification");

-- CreateIndex
CREATE INDEX "goals_section_idx" ON "goals"("section");

-- AddForeignKey
ALTER TABLE "officer_performance_tracking" ADD CONSTRAINT "officer_performance_tracking_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
