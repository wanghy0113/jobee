-- CreateTable
CREATE TABLE "UserJobSearch" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_location" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserJobSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJobSearchResult" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_job_search_id" TEXT NOT NULL,
    "google_job_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_location" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "job_data" JSONB NOT NULL,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserJobSearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserJobSearchResult_google_job_id_key" ON "UserJobSearchResult"("google_job_id");

-- AddForeignKey
ALTER TABLE "UserJobSearch" ADD CONSTRAINT "UserJobSearch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobSearchResult" ADD CONSTRAINT "UserJobSearchResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobSearchResult" ADD CONSTRAINT "UserJobSearchResult_user_job_search_id_fkey" FOREIGN KEY ("user_job_search_id") REFERENCES "UserJobSearch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
