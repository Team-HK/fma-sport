-- Polls (sondages): 3 enums + 5 tables. Purely additive: nothing existing is altered or dropped.
-- Generated with `prisma migrate diff` against the production schema, then reviewed.
--
-- Apply ONCE, before the code that uses it goes live:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f prisma/sql/2026-10-polls.sql
-- (or: npx prisma db push — same result). Single transaction (-1): all or nothing.
-- Undo: prisma/sql/2026-10-polls.rollback.sql
--
-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');
-- CreateEnum
CREATE TYPE "PollResultsVisibility" AS ENUM ('ALWAYS', 'AFTER_VOTE', 'AFTER_CLOSE', 'NEVER');
-- CreateEnum
CREATE TYPE "PollIdentification" AS ENUM ('NONE', 'EMAIL', 'PHONE');
-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "status" "PollStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "resultsVisibility" "PollResultsVisibility" NOT NULL DEFAULT 'AFTER_VOTE',
    "identification" "PollIdentification" NOT NULL DEFAULT 'NONE',
    "maxBallotsPerDevice" INTEGER NOT NULL DEFAULT 10,
    "maxBallotsPerIpPerHour" INTEGER NOT NULL DEFAULT 30,
    "minFillSeconds" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "poll_questions" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "picks" INTEGER NOT NULL DEFAULT 1,
    "ranked" BOOLEAN NOT NULL DEFAULT true,
    "allowWriteIn" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "poll_questions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "club" TEXT,
    "photo" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "poll_ballots" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "deviceHash" TEXT,
    "contactHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "poll_ballots_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "polls_slug_key" ON "polls"("slug");
-- CreateIndex
CREATE INDEX "polls_status_deletedAt_idx" ON "polls"("status", "deletedAt");
-- CreateIndex
CREATE INDEX "poll_questions_pollId_order_idx" ON "poll_questions"("pollId", "order");
-- CreateIndex
CREATE INDEX "poll_options_questionId_order_idx" ON "poll_options"("questionId", "order");
-- CreateIndex
CREATE INDEX "poll_ballots_pollId_ipHash_createdAt_idx" ON "poll_ballots"("pollId", "ipHash", "createdAt");
-- CreateIndex
CREATE INDEX "poll_ballots_pollId_deviceHash_idx" ON "poll_ballots"("pollId", "deviceHash");
-- CreateIndex
CREATE UNIQUE INDEX "poll_ballots_pollId_voterHash_key" ON "poll_ballots"("pollId", "voterHash");
-- CreateIndex
CREATE UNIQUE INDEX "poll_ballots_pollId_contactHash_key" ON "poll_ballots"("pollId", "contactHash");
-- CreateIndex
CREATE INDEX "poll_votes_questionId_optionId_idx" ON "poll_votes"("questionId", "optionId");
-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_ballotId_questionId_optionId_key" ON "poll_votes"("ballotId", "questionId", "optionId");
-- AddForeignKey
ALTER TABLE "poll_questions" ADD CONSTRAINT "poll_questions_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "poll_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "poll_ballots" ADD CONSTRAINT "poll_ballots_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "poll_ballots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "poll_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
