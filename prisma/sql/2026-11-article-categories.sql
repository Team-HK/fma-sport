-- Article categories become data (Admin > Catégories) instead of a fixed enum.
--
-- What it does (single transaction, `-1`):
--   1. creates "article_categories" and inserts the 8 current categories with the SAME codes
--      the articles already use (SENEGAL, AFRIQUE, ...), so no article changes;
--   2. converts articles.category from the "ArticleCategory" enum to TEXT (same values);
--   3. adds a foreign key articles.category -> article_categories.slug;
--   4. drops the now unused enum type.
--
-- Apply ONCE, right before the code that uses it is deployed:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f prisma/sql/2026-11-article-categories.sql
-- Undo: prisma/sql/2026-11-article-categories.rollback.sql
--
-- Note: the ALTER briefly locks "articles" (a few ms for ~340 rows).

CREATE TABLE "article_categories" (
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("slug")
);

CREATE INDEX "article_categories_active_order_idx" ON "article_categories"("active", "order");

INSERT INTO "article_categories" ("slug", "label", "order", "active", "locked", "updatedAt") VALUES
    ('SENEGAL', 'Sénégal', 1, true, false, CURRENT_TIMESTAMP),
    ('AFRIQUE', 'Afrique', 2, true, true, CURRENT_TIMESTAMP),
    ('INTERNATIONAL', 'International', 3, true, true, CURRENT_TIMESTAMP),
    ('MERCATO', 'Mercato', 4, true, false, CURRENT_TIMESTAMP),
    ('CAN', 'CAN', 5, true, false, CURRENT_TIMESTAMP),
    ('LIGUE_DES_CHAMPIONS', 'Ligue des champions', 6, true, false, CURRENT_TIMESTAMP),
    ('JEUNES_TALENTS', 'Jeunes talents', 7, true, false, CURRENT_TIMESTAMP),
    ('SELECTIONS_NATIONALES', 'Sélections nationales', 8, true, false, CURRENT_TIMESTAMP);

ALTER TABLE "articles" ALTER COLUMN "category" TYPE TEXT USING "category"::text;

ALTER TABLE "articles" ADD CONSTRAINT "articles_category_fkey"
    FOREIGN KEY ("category") REFERENCES "article_categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TYPE "ArticleCategory";
