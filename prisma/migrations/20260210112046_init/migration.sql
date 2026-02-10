-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'employee');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'in-progress', 'submitted', 'reviewed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'employee',
    "department" VARCHAR(255),
    "position" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_templates" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "period" VARCHAR(100) NOT NULL,
    "deadline" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "weightage" INTEGER NOT NULL,
    "goal_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_assignments" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_submissions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "employee_name" VARCHAR(255) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_responses" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "response" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_reviews" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "reviewer_name" VARCHAR(255) NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "overall_comment" TEXT,
    "reviewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_reviews" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "appraisal_templates_created_by_idx" ON "appraisal_templates"("created_by");

-- CreateIndex
CREATE INDEX "appraisal_templates_status_idx" ON "appraisal_templates"("status");

-- CreateIndex
CREATE INDEX "goals_template_id_idx" ON "goals"("template_id");

-- CreateIndex
CREATE INDEX "template_assignments_template_id_idx" ON "template_assignments"("template_id");

-- CreateIndex
CREATE INDEX "template_assignments_employee_id_idx" ON "template_assignments"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_assignments_template_id_employee_id_key" ON "template_assignments"("template_id", "employee_id");

-- CreateIndex
CREATE INDEX "appraisal_submissions_template_id_idx" ON "appraisal_submissions"("template_id");

-- CreateIndex
CREATE INDEX "appraisal_submissions_employee_id_idx" ON "appraisal_submissions"("employee_id");

-- CreateIndex
CREATE INDEX "appraisal_submissions_status_idx" ON "appraisal_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_submissions_template_id_employee_id_key" ON "appraisal_submissions"("template_id", "employee_id");

-- CreateIndex
CREATE INDEX "goal_responses_submission_id_idx" ON "goal_responses"("submission_id");

-- CreateIndex
CREATE INDEX "goal_responses_goal_id_idx" ON "goal_responses"("goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_responses_submission_id_goal_id_key" ON "goal_responses"("submission_id", "goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_reviews_submission_id_key" ON "appraisal_reviews"("submission_id");

-- CreateIndex
CREATE INDEX "appraisal_reviews_submission_id_idx" ON "appraisal_reviews"("submission_id");

-- CreateIndex
CREATE INDEX "appraisal_reviews_reviewer_id_idx" ON "appraisal_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "goal_reviews_review_id_idx" ON "goal_reviews"("review_id");

-- CreateIndex
CREATE INDEX "goal_reviews_goal_id_idx" ON "goal_reviews"("goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_reviews_review_id_goal_id_key" ON "goal_reviews"("review_id", "goal_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_templates" ADD CONSTRAINT "appraisal_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "appraisal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_assignments" ADD CONSTRAINT "template_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_assignments" ADD CONSTRAINT "template_assignments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "appraisal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_submissions" ADD CONSTRAINT "appraisal_submissions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_submissions" ADD CONSTRAINT "appraisal_submissions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "appraisal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_responses" ADD CONSTRAINT "goal_responses_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_responses" ADD CONSTRAINT "goal_responses_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "appraisal_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_reviews" ADD CONSTRAINT "appraisal_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_reviews" ADD CONSTRAINT "appraisal_reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "appraisal_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_reviews" ADD CONSTRAINT "goal_reviews_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_reviews" ADD CONSTRAINT "goal_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "appraisal_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
