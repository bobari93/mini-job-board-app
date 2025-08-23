-- First, add a user_id column to track job ownership (if it doesn't exist)
-- ALTER TABLE job ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security on the job table
ALTER TABLE job ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all jobs (for job board)
CREATE POLICY "Allow authenticated users to read jobs" ON job
FOR SELECT
TO authenticated
USING (true);

-- Policy for authenticated users to insert jobs (with user_id)
CREATE POLICY "Allow authenticated users to insert jobs" ON job
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own jobs
CREATE POLICY "Allow authenticated users to update own jobs" ON job
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to delete their own jobs
CREATE POLICY "Allow authenticated users to delete own jobs" ON job
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Optional: If you want to allow public read access (for job listings)
-- CREATE POLICY "Allow public read access" ON job
-- FOR SELECT
-- TO anon
-- USING (true);
