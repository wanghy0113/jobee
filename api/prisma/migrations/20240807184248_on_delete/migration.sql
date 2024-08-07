-- DropForeignKey
ALTER TABLE "UserEducation" DROP CONSTRAINT "UserEducation_userResumeId_fkey";

-- DropForeignKey
ALTER TABLE "UserResume" DROP CONSTRAINT "UserResume_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkExperience" DROP CONSTRAINT "UserWorkExperience_userResumeId_fkey";

-- AlterTable
ALTER TABLE "UserEducation" ALTER COLUMN "startDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserWorkExperience" ALTER COLUMN "startDate" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserResume" ADD CONSTRAINT "UserResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkExperience" ADD CONSTRAINT "UserWorkExperience_userResumeId_fkey" FOREIGN KEY ("userResumeId") REFERENCES "UserResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_userResumeId_fkey" FOREIGN KEY ("userResumeId") REFERENCES "UserResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
