/*
  Warnings:

  - You are about to drop the column `delta` on the `cv_versions` table. All the data in the column will be lost.
  - You are about to drop the column `component_ids` on the `cvs` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `cv_components` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `snapshot` to the `cv_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "application_analyses" DROP CONSTRAINT "application_analyses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cv_components" DROP CONSTRAINT "cv_components_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cvs" DROP CONSTRAINT "cvs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "job_postings" DROP CONSTRAINT "job_postings_user_id_fkey";

-- AlterTable
ALTER TABLE "application_analyses" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "cv_versions" DROP COLUMN "delta",
ADD COLUMN     "snapshot" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "cvs" DROP COLUMN "component_ids",
ADD COLUMN     "education" JSONB,
ADD COLUMN     "experience" JSONB,
ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "personal_info" JSONB,
ADD COLUMN     "skills" JSONB,
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job_postings" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "passwordHash",
ADD COLUMN     "password_hash" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- DropTable
DROP TABLE "cv_components";

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_analyses" ADD CONSTRAINT "application_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
