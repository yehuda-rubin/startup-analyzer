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
    stage = Column(String(50))  # Seed, Series A, B, C, etc.
    founded_year = Column(Integer)
    website = Column(String(500))
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
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
    file_type = Column(String(50))  # pdf, docx, pptx, xlsx
    file_size = Column(Integer)
    content_text = Column(Text)
    vector_ids = Column(JSON)  # Store FAISS vector IDs
    metadata = Column(JSON)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    startup = relationship("Startup", back_populates="documents")


class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    analysis_type = Column(String(100))  # business_model, team, market, etc.
    
    # Analysis Results
    summary = Column(Text)
    key_insights = Column(JSON)  # Array of insights
    strengths = Column(JSON)  # Array of strengths
    weaknesses = Column(JSON)  # Array of weaknesses
    opportunities = Column(JSON)  # Array of opportunities
    threats = Column(JSON)  # Array of threats
    
    # RAG Context
    context_used = Column(JSON)  # Documents/chunks used
    confidence_score = Column(Float)
    
    raw_response = Column(Text)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    startup = relationship("Startup", back_populates="analyses")


class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    
    # Overall Score
    overall_score = Column(Float, nullable=False)  # 0-100
    
    # Category Scores
    team_score = Column(Float)
    product_score = Column(Float)
    market_score = Column(Float)
    traction_score = Column(Float)
    financials_score = Column(Float)
    innovation_score = Column(Float)
    
    # Detailed Breakdown
    score_breakdown = Column(JSON)
    reasoning = Column(Text)
    
    # Metadata
    scoring_criteria = Column(JSON)
    confidence_level = Column(String(50))  # High, Medium, Low
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    startup = relationship("Startup", back_populates="scores")


class MarketAnalysis(Base):
    __tablename__ = "market_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    
    # TAM/SAM/SOM
    tam = Column(Float)  # Total Addressable Market (in USD)
    sam = Column(Float)  # Serviceable Addressable Market
    som = Column(Float)  # Serviceable Obtainable Market
    
    tam_description = Column(Text)
    sam_description = Column(Text)
    som_description = Column(Text)
    
    # Market Insights
    market_size_reasoning = Column(Text)
    growth_rate = Column(Float)
    market_trends = Column(JSON)
    competitors = Column(JSON)
    competitive_advantages = Column(JSON)
    
    # Sources
    data_sources = Column(JSON)
    confidence_score = Column(Float)
    
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    startup = relationship("Startup", back_populates="market_analyses")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    report_type = Column(String(100))  # investor_report, due_diligence, comparison
    
    title = Column(String(500))
    content = Column(Text)
    content_json = Column(JSON)  # Structured report data
    
    executive_summary = Column(Text)
    recommendations = Column(JSON)
    
    generated_by = Column(String(100))  # LLM model used
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())