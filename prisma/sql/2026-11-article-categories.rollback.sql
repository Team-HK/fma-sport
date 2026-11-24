-- Restores the fixed enum. Fails (and changes nothing) if an article uses a category that is not
-- one of the 8 original codes: move those articles to an original category first.
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f prisma/sql/2026-11-article-categories.rollback.sql
CREATE TYPE "ArticleCategory" AS ENUM ('SENEGAL', 'AFRIQUE', 'INTERNATIONAL', 'MERCATO', 'CAN', 'LIGUE_DES_CHAMPIONS', 'JEUNES_TALENTS', 'SELECTIONS_NATIONALES');
ALTER TABLE "articles" DROP CONSTRAINT "articles_category_fkey";
ALTER TABLE "articles" ALTER COLUMN "category" TYPE "ArticleCategory" USING "category"::"ArticleCategory";
DROP TABLE "article_categories";
