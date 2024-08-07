/*
  Warnings:

  - You are about to drop the column `description` on the `UserEducation` table. All the data in the column will be lost.
  - You are about to drop the column `field` on the `UserEducation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `UserWorkExperience` table. All the data in the column will be lost.
  - Added the required column `major` to the `UserEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `UserResume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `UserResume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserEducation" DROP COLUMN "description",
DROP COLUMN "field",
ADD COLUMN     "gpa" TEXT,
ADD COLUMN     "major" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserResume" ADD COLUMN     "achievements" TEXT[],
ADD COLUMN     "address" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "UserWorkExperience" DROP COLUMN "description",
ADD COLUMN     "contents" TEXT[],
ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "location" DROP NOT NULL;
