from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Startup(Base):
    __tablename__ = "startups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    industry = Column(String(100))
    stage = Column(String(50))
    founded_year = Column(Integer)
    website = Column(String(500))
    meta_data = Column(JSON)  # ✅ שונה מ-metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    documents = relationship("Document", back_populates="startup", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="startup", cascade="all, delete-orphan")
    scores = relationship("Score", back_populates="startup", cascade="all, delete-orphan")
    market_analyses = relationship("MarketAnalysis", back_populates="startup", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)
    content_text = Column(Text)
    vector_ids = Column(JSON)
    meta_data = Column(JSON)  # ✅ שונה
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    startup = relationship("Startup", back_populates="documents")


class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    analysis_type = Column(String(100))
    
    summary = Column(Text)
    key_insights = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    opportunities = Column(JSON)
    threats = Column(JSON)
    
    context_used = Column(JSON)
    confidence_score = Column(Float)
    
    raw_response = Column(Text)
    web_validation_summary = Column(Text)  # ← 🆕 הוסף את השורה הזו!
    meta_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    startup = relationship("Startup", back_populates="analyses")

    # Add these fields to Analysis class
    user_id = Column(String(255), nullable=True, index=True)
    chat_questions_count = Column(Integer, default=0)
    chat_messages = relationship("ChatMessage", back_populates="analysis", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    
    overall_score = Column(Float, nullable=False)
    
    team_score = Column(Float)
    product_score = Column(Float)
    market_score = Column(Float)
    traction_score = Column(Float)
    financials_score = Column(Float)
    innovation_score = Column(Float)
    
    score_breakdown = Column(JSON)
    reasoning = Column(Text)
    
    scoring_criteria = Column(JSON)
    confidence_level = Column(String(50))
    meta_data = Column(JSON)  # ✅ שונה
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    startup = relationship("Startup", back_populates="scores")


class MarketAnalysis(Base):
    __tablename__ = "market_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    
    tam = Column(Float)
    sam = Column(Float)
    som = Column(Float)
    
    tam_description = Column(Text)
    sam_description = Column(Text)
    som_description = Column(Text)
    
    market_size_reasoning = Column(Text)
    growth_rate = Column(Float)
    market_trends = Column(JSON)
    competitors = Column(JSON)
    competitive_advantages = Column(JSON)
    
    data_sources = Column(JSON)
    confidence_score = Column(Float)
    
    meta_data = Column(JSON)  # ✅ שונה
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    startup = relationship("Startup", back_populates="market_analyses")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    report_type = Column(String(100))
    
    title = Column(String(500))
    content = Column(Text)
    content_json = Column(JSON)
    
    executive_summary = Column(Text)
    recommendations = Column(JSON)
    
    generated_by = Column(String(100))
    meta_data = Column(JSON)  # ✅ שונה
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserUsage(Base):
    """Track user quota usage for rate limiting"""
    __tablename__ = "user_usage"
    
    user_id = Column(String(255), primary_key=True, index=True)
    
    # Questions tracking
    daily_questions = Column(Integer, default=0)
    weekly_questions = Column(Integer, default=0)
    monthly_questions = Column(Integer, default=0)
    
    # Analyses tracking
    daily_analyses = Column(Integer, default=0)
    weekly_analyses = Column(Integer, default=0)
    monthly_analyses = Column(Integer, default=0)
    
    # Reset timestamps
    daily_reset_at = Column(DateTime(timezone=True), nullable=False)
    weekly_reset_at = Column(DateTime(timezone=True), nullable=False)
    monthly_reset_at = Column(DateTime(timezone=True), nullable=False)
    
    # Subscription info
    subscription_tier = Column(String(20), default='free')
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # ❌ NO relationship here - we don't need it!


class ChatMessage(Base):
    """Store chat conversations about analyses"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    
    # Message content
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    
    # Context used for RAG
    context_chunks = Column(JSON, nullable=True)
    
    # Token tracking
    tokens_used = Column(Integer, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    analysis = relationship("Analysis", back_populates="chat_messages")
    # ❌ NO user relationship - we don't need it!