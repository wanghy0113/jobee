-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "primary_role" TEXT,
    "cb_url" TEXT,
    "domain" TEXT,
    "homepage_url" TEXT,
    "logo_url" TEXT,
    "facebook_url" TEXT,
    "twitter_url" TEXT,
    "linkedin_url" TEXT,
    "combined_stock_symbols" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country_code" TEXT,
    "short_description" TEXT,
    "short_description_embedding" vector(768),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE INDEX organization_name_trgm_gist_idx on "Organization" using gist(name gist_trgm_ops(siglen=64));
CREATE INDEX idx_gin_trgm ON "Organization" USING gin (name gin_trgm_ops);

-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "admin1" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "pop" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);
