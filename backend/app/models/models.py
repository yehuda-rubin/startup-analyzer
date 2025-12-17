from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    firebase_uid = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # 'entrepreneur' | 'investor'
    created_at = Column(DateTime(timezone=True), server_default=func.now())


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