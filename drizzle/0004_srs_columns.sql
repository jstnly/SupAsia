-- Spaced repetition (SM-2-lite) for lesson-level reviews.
-- Adds scheduling columns to the existing `progress` table so completed lessons
-- can resurface at the optimal moment to fight the forgetting curve.
--
-- ease_factor is stored × 100 (so 250 == 2.5) to avoid float math in SQL.
-- A row's nextReviewAt being NULL means it's never been graded.
ALTER TABLE progress
  ADD COLUMN IF NOT EXISTS interval_days   INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ease_factor     INTEGER   NOT NULL DEFAULT 250,
  ADD COLUMN IF NOT EXISTS reviews         INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses          INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_review_at  TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP;

-- Fast lookup of "what's due for me right now"
CREATE INDEX IF NOT EXISTS progress_next_review_idx
  ON progress (user_id, next_review_at);
