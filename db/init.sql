-- PostgreSQL syntax - database already created by Docker

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    stage VARCHAR(50),
    founded_year INTEGER,
    website VARCHAR(500),
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    content_text TEXT,
    vector_ids JSONB,
    meta_data JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100),
    summary TEXT,
    key_insights JSONB,
    strengths JSONB,
    weaknesses JSONB,
    opportunities JSONB,
    threats JSONB,
    context_used JSONB,
    confidence_score FLOAT,
    raw_response TEXT,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    overall_score FLOAT NOT NULL,
    team_score FLOAT,
    product_score FLOAT,
    market_score FLOAT,
    traction_score FLOAT,
    financials_score FLOAT,
    innovation_score FLOAT,
    score_breakdown JSONB,
    reasoning TEXT,
    scoring_criteria JSONB,
    confidence_level VARCHAR(50),
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Market analyses table
CREATE TABLE IF NOT EXISTS market_analyses (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    tam FLOAT,
    sam FLOAT,
    som FLOAT,
    tam_description TEXT,
    sam_description TEXT,
    som_description TEXT,
    market_size_reasoning TEXT,
    growth_rate FLOAT,
    market_trends JSONB,
    competitors JSONB,
    competitive_advantages JSONB,
    data_sources JSONB,
    confidence_score FLOAT,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    report_type VARCHAR(100),
    title VARCHAR(500),
    content TEXT,
    content_json JSONB,
    executive_summary TEXT,
    recommendations JSONB,
    generated_by VARCHAR(100),
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_startups_name ON startups(name);
CREATE INDEX IF NOT EXISTS idx_documents_startup ON documents(startup_id);
CREATE INDEX IF NOT EXISTS idx_analyses_startup ON analyses(startup_id);
CREATE INDEX IF NOT EXISTS idx_scores_startup ON scores(startup_id);
CREATE INDEX IF NOT EXISTS idx_market_analyses_startup ON market_analyses(startup_id);
CREATE INDEX IF NOT EXISTS idx_reports_startup ON reports(startup_id);

-- Seed data (example startups)
INSERT INTO startups (name, description, industry, stage, founded_year) 
SELECT 'TechVision AI', 'AI-powered computer vision for autonomous vehicles', 'Artificial Intelligence', 'Series A', 2022
WHERE NOT EXISTS (SELECT 1 FROM startups WHERE name = 'TechVision AI');

INSERT INTO startups (name, description, industry, stage, founded_year) 
SELECT 'HealthSync', 'Telemedicine platform connecting patients with specialists', 'Healthcare', 'Seed', 2023
WHERE NOT EXISTS (SELECT 1 FROM startups WHERE name = 'HealthSync');

INSERT INTO startups (name, description, industry, stage, founded_year) 
SELECT 'GreenEnergy Solutions', 'Renewable energy optimization using ML', 'Clean Energy', 'Series B', 2021
WHERE NOT EXISTS (SELECT 1 FROM startups WHERE name = 'GreenEnergy Solutions');