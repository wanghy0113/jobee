/*
  Warnings:

  - You are about to drop the column `end_date` on the `UserEducation` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `UserEducation` table. All the data in the column will be lost.
  - You are about to drop the column `job_location` on the `UserJobSearch` table. All the data in the column will be lost.
  - You are about to drop the column `job_title` on the `UserJobSearch` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserJobSearch` table. All the data in the column will be lost.
  - You are about to drop the column `resume_raw_text` on the `UserResume` table. All the data in the column will be lost.
  - You are about to drop the column `resume_url` on the `UserResume` table. All the data in the column will be lost.
  - You are about to drop the column `google_job_id` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `job_data` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `job_description` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `job_location` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `job_title` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserSavedJobs` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `UserWorkExperience` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `UserWorkExperience` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserWorkExperience` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,googleJobId]` on the table `UserSavedJobs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `startDate` to the `UserEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobLocation` to the `UserJobSearch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `UserJobSearch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserJobSearch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleJobId` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobData` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobDescription` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobLocation` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserSavedJobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `UserWorkExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserWorkExperience` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserJobSearch" DROP CONSTRAINT "UserJobSearch_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSavedJobs" DROP CONSTRAINT "UserSavedJobs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkExperience" DROP CONSTRAINT "UserWorkExperience_user_id_fkey";

-- DropIndex
DROP INDEX "UserSavedJobs_user_id_google_job_id_key";

-- AlterTable
ALTER TABLE "UserEducation" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserJobSearch" DROP COLUMN "job_location",
DROP COLUMN "job_title",
DROP COLUMN "user_id",
ADD COLUMN     "jobLocation" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserResume" DROP COLUMN "resume_raw_text",
DROP COLUMN "resume_url",
ADD COLUMN     "resumeRawText" TEXT,
ADD COLUMN     "resumeUrl" TEXT;

-- AlterTable
ALTER TABLE "UserSavedJobs" DROP COLUMN "google_job_id",
DROP COLUMN "job_data",
DROP COLUMN "job_description",
DROP COLUMN "job_location",
DROP COLUMN "job_title",
DROP COLUMN "user_id",
ADD COLUMN     "googleJobId" TEXT NOT NULL,
ADD COLUMN     "jobData" JSONB NOT NULL,
ADD COLUMN     "jobDescription" TEXT NOT NULL,
ADD COLUMN     "jobLocation" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserWorkExperience" DROP COLUMN "end_date",
DROP COLUMN "start_date",
DROP COLUMN "user_id",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedJobs_userId_googleJobId_key" ON "UserSavedJobs"("userId", "googleJobId");

-- AddForeignKey
ALTER TABLE "UserWorkExperience" ADD CONSTRAINT "UserWorkExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobSearch" ADD CONSTRAINT "UserJobSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedJobs" ADD CONSTRAINT "UserSavedJobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
