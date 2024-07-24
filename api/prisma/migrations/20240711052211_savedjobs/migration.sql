/*
  Warnings:

  - You are about to drop the `UserJobSearchResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserJobSearchResult" DROP CONSTRAINT "UserJobSearchResult_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserJobSearchResult" DROP CONSTRAINT "UserJobSearchResult_user_job_search_id_fkey";

-- DropTable
DROP TABLE "UserJobSearchResult";

-- CreateTable
CREATE TABLE "UserSavedJobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "google_job_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_location" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "job_data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSavedJobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedJobs_user_id_google_job_id_key" ON "UserSavedJobs"("user_id", "google_job_id");

-- AddForeignKey
ALTER TABLE "UserSavedJobs" ADD CONSTRAINT "UserSavedJobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
