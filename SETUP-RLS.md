# Fix Row Level Security (RLS) Policy Issue

The error you're seeing is because Supabase has Row Level Security (RLS) enabled by default, but no policies are set up to allow authenticated users to perform CRUD operations on the `job` table.

## Quick Fix (Option 1 - Simple)

Run this SQL in your Supabase SQL Editor:

```sql
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

-- Policy for authenticated users to update jobs
CREATE POLICY "Allow authenticated users to update jobs" ON job
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for authenticated users to delete jobs
CREATE POLICY "Allow authenticated users to delete jobs" ON job
FOR DELETE
TO authenticated
USING (true);
```

## Better Fix (Option 2 - With Ownership)

If you want to track job ownership, first add a user_id column:

```sql
-- Add user_id column to track ownership
ALTER TABLE job ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security
ALTER TABLE job ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all jobs
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
```

## How to Apply

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from either option above
4. Click "Run" to execute the SQL

## What This Does

- **Option 1**: Allows any authenticated user to perform all CRUD operations on any job
- **Option 2**: Allows users to only modify jobs they created (more secure)

The code has been updated to automatically include the user_id when creating jobs, so Option 2 is recommended for better security.

## After Running the SQL

The job creation should work immediately. The hook will now:
1. Get the current authenticated user
2. Include the user_id when creating jobs
3. Respect the RLS policies you've set up
