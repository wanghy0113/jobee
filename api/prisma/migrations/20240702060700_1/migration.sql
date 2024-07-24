/*
  Warnings:

  - A unique constraint covering the columns `[user_job_search_id,google_job_id]` on the table `UserJobSearchResult` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserJobSearchResult_google_job_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserJobSearchResult_user_job_search_id_google_job_id_key" ON "UserJobSearchResult"("user_job_search_id", "google_job_id");
