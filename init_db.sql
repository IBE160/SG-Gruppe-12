-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS application_analyses;
DROP TABLE IF EXISTS cvs;
DROP TABLE IF EXISTS cv_components;
DROP TABLE IF EXISTS job_postings;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cv_components table
CREATE TABLE cv_components (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- 'education', 'work_experience', 'skill', 'project', 'summary'
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cvs table
CREATE TABLE cvs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    component_ids INTEGER[] NOT NULL, -- An array of cv_components.id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_postings table
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Optional: if a user saves a posting
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    description TEXT NOT NULL,
    url VARCHAR(2048),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create application_analyses table
CREATE TABLE application_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_id INTEGER NOT NULL REFERENCES cvs(id),
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id),
    generated_application_content TEXT,
    generated_cv_content TEXT,
    ats_feedback JSONB,
    quality_feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for frequently queried columns
CREATE INDEX ON cv_components (user_id);
CREATE INDEX ON cvs (user_id);
CREATE INDEX ON job_postings (user_id);
CREATE INDEX ON application_analyses (user_id);
CREATE INDEX ON application_analyses (cv_id);
CREATE INDEX ON application_analyses (job_posting_id);
