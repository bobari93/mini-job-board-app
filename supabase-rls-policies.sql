-- Enable Row Level Security on the job table
ALTER TABLE job ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all jobs
CREATE POLICY "Allow authenticated users to read jobs" ON job
FOR SELECT
TO authenticated
USING (true);

-- Policy for authenticated users to insert jobs
CREATE POLICY "Allow authenticated users to insert jobs" ON job
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for authenticated users to update their own jobs
-- You can modify this to be more restrictive if needed
CREATE POLICY "Allow authenticated users to update jobs" ON job
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for authenticated users to delete jobs
-- You can modify this to be more restrictive if needed
CREATE POLICY "Allow authenticated users to delete jobs" ON job
FOR DELETE
TO authenticated
USING (true);

-- Optional: If you want to allow public read access (for job listings)
-- CREATE POLICY "Allow public read access" ON job
-- FOR SELECT
-- TO anon
-- USING (true);
