-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS "application_analyses";
DROP TABLE IF EXISTS "cv_versions";
DROP TABLE IF EXISTS "cvs";
DROP TABLE IF EXISTS "job_postings";
DROP TABLE IF EXISTS "users";

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "consent_essential" BOOLEAN NOT NULL DEFAULT true,
    "consent_ai_training" BOOLEAN NOT NULL DEFAULT false,
    "consent_marketing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create cvs table
CREATE TABLE "cvs" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "file_path" TEXT,
    "personal_info" JSONB,
    "education" JSONB,
    "experience" JSONB,
    "skills" JSONB,
    "languages" JSONB,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- Create job_postings table
CREATE TABLE "job_postings" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- Create application_analyses table
CREATE TABLE "application_analyses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "cv_id" INTEGER NOT NULL,
    "job_posting_id" INTEGER NOT NULL,
    "generated_application_content" TEXT,
    "generated_cv_content" TEXT,
    "ats_feedback" JSONB,
    "quality_feedback" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_analyses_pkey" PRIMARY KEY ("id")
);

-- Create cv_versions table
CREATE TABLE "cv_versions" (
    "id" SERIAL NOT NULL,
    "cv_id" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_analyses" ADD CONSTRAINT "application_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_analyses" ADD CONSTRAINT "application_analyses_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_analyses" ADD CONSTRAINT "application_analyses_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_versions" ADD CONSTRAINT "cv_versions_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "cv_versions_cv_id_version_number_key" ON "cv_versions"("cv_id", "version_number");