-- ================================================
-- COMPLETE DATABASE SCHEMA - VERSION 1.3 (FINAL)
-- Project: Startup Analyzer
-- Sync: Fixes content_text and uploaded_at issues
-- ================================================

BEGIN;

-- 1. STARTUPS: Core entity
CREATE TABLE IF NOT EXISTS startups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    stage VARCHAR(50),
    founded_year INTEGER,
    website VARCHAR(255),
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_startups_name ON startups(name);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON startups(industry);

-- 2. DOCUMENTS: PDF/Files and OCR results (Synced with Backend)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_path VARCHAR(500),
    file_size INTEGER,
    content_text TEXT,
    vector_ids TEXT,  -- ⭐ הוספה - רשימת IDs של וקטורים ב-FAISS
    meta_data JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_startup ON documents(startup_id);

-- 3. ANALYSES: AI Intelligence & Chat integration
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    summary TEXT,
    key_insights JSONB,
    strengths JSONB,
    weaknesses JSONB,
    opportunities JSONB,
    threats JSONB,
    context_used JSONB,
    confidence_score FLOAT,
    raw_response TEXT,
    web_validation_summary TEXT,
    meta_data JSONB,
    user_id VARCHAR(255), -- Firebase UID
    chat_questions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analyses_startup ON analyses(startup_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);

-- 4. SCORES: Quantitative metrics
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    overall_score FLOAT,
    team_score FLOAT,
    product_score FLOAT,
    market_score FLOAT,
    traction_score FLOAT,
    financials_score FLOAT,
    innovation_score FLOAT,
    score_breakdown JSONB,
    reasoning TEXT,               -- ⭐ שונה מ-JSONB
    scoring_criteria JSONB,
    confidence_level VARCHAR(20), -- ⭐ שונה מ-FLOAT
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_startup ON scores(startup_id);

-- 5. MARKET ANALYSES: Market sizing
CREATE TABLE IF NOT EXISTS market_analyses (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    tam BIGINT,
    sam BIGINT,
    som BIGINT,
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

CREATE INDEX IF NOT EXISTS idx_market_analyses_startup ON market_analyses(startup_id);

-- 6. REPORTS: Generated PDFs/Summaries
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    sections JSONB,
    charts JSONB,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. USER USAGE: Quotas and Rate Limiting
CREATE TABLE IF NOT EXISTS user_usage (
    user_id VARCHAR(255) PRIMARY KEY,
    daily_questions INTEGER DEFAULT 0,
    weekly_questions INTEGER DEFAULT 0,
    monthly_questions INTEGER DEFAULT 0,
    daily_analyses INTEGER DEFAULT 0,
    weekly_analyses INTEGER DEFAULT 0,
    monthly_analyses INTEGER DEFAULT 0,
    daily_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
    weekly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('week', CURRENT_TIMESTAMP) + INTERVAL '1 week'),
    monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CHAT MESSAGES: Historical conversation logs
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    context_chunks JSONB,
    tokens_used INTEGER,
    estimated_cost FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_history ON chat_messages(user_id, analysis_id);

-- ================================================
-- VIEWS AND FUNCTIONS
-- ================================================

-- Usage stats for Admin
CREATE OR REPLACE VIEW usage_stats AS
SELECT 
    u.user_id,
    u.subscription_tier,
    u.daily_questions,
    u.daily_analyses,
    COUNT(DISTINCT a.id) as total_analyses,
    COUNT(DISTINCT cm.id) as total_chat_messages,
    COALESCE(SUM(cm.tokens_used), 0) as total_tokens
FROM user_usage u
LEFT JOIN analyses a ON a.user_id = u.user_id
LEFT JOIN chat_messages cm ON cm.user_id = u.user_id
GROUP BY u.user_id, u.subscription_tier, u.daily_questions, u.daily_analyses;

-- Reset function (Run via Cron)
CREATE OR REPLACE FUNCTION reset_user_usage_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_usage SET daily_questions = 0, daily_analyses = 0, daily_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 day' WHERE daily_reset_at <= CURRENT_TIMESTAMP;
    UPDATE user_usage SET weekly_questions = 0, weekly_analyses = 0, weekly_reset_at = DATE_TRUNC('week', CURRENT_TIMESTAMP) + INTERVAL '1 week' WHERE weekly_reset_at <= CURRENT_TIMESTAMP;
    UPDATE user_usage SET monthly_questions = 0, monthly_analyses = 0, monthly_reset_at = DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' WHERE monthly_reset_at <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;