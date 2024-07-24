/*
  Warnings:

  - You are about to drop the column `user_id` on the `UserEducation` table. All the data in the column will be lost.
  - You are about to drop the column `resumeRawText` on the `UserResume` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `UserResume` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserResume` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserWorkExperience` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserResume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserResume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserEducation" DROP CONSTRAINT "UserEducation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserResume" DROP CONSTRAINT "UserResume_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkExperience" DROP CONSTRAINT "UserWorkExperience_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userResumeId" TEXT;

-- AlterTable
ALTER TABLE "UserEducation" DROP COLUMN "user_id",
ADD COLUMN     "awards" TEXT[],
ADD COLUMN     "userResumeId" TEXT;

-- AlterTable
ALTER TABLE "UserResume" DROP COLUMN "resumeRawText",
DROP COLUMN "resumeUrl",
DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserWorkExperience" DROP COLUMN "userId",
ADD COLUMN     "userResumeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserResume_userId_key" ON "UserResume"("userId");

-- AddForeignKey
ALTER TABLE "UserResume" ADD CONSTRAINT "UserResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkExperience" ADD CONSTRAINT "UserWorkExperience_userResumeId_fkey" FOREIGN KEY ("userResumeId") REFERENCES "UserResume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_userResumeId_fkey" FOREIGN KEY ("userResumeId") REFERENCES "UserResume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
