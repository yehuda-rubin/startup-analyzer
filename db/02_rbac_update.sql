-- Create users table
CREATE TABLE IF NOT EXISTS users (
    firebase_uid VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('entrepreneur', 'investor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to startups table (assuming 'startups' is the 'projects' table)
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(128) REFERENCES users(firebase_uid);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
