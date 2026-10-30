-- Removes ONLY the poll feature (and every poll, ballot and vote). Run in a transaction:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f prisma/sql/2026-10-polls.rollback.sql
DROP TABLE IF EXISTS "poll_votes";
DROP TABLE IF EXISTS "poll_ballots";
DROP TABLE IF EXISTS "poll_options";
DROP TABLE IF EXISTS "poll_questions";
DROP TABLE IF EXISTS "polls";
DROP TYPE IF EXISTS "PollIdentification";
DROP TYPE IF EXISTS "PollResultsVisibility";
DROP TYPE IF EXISTS "PollStatus";
