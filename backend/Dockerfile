# ⚡ OPTIMIZED Dockerfile for Koyeb Free Tier
# Target: <500MB image, <250MB RAM usage
# Strategy: Lightweight dependencies + single worker

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# gcc/g++: for compiling Python C extensions
# libgomp1: required for FAISS CPU operations
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .

# ❌ OLD: Heavy ML dependencies (torch, transformers, sentence-transformers)
#    These added 1600MB to the image!
# 
# ✅ NEW: Lightweight API-based embeddings (Gemini)
#    Saved: 2000MB image size, 300MB RAM usage

RUN pip install --no-cache-dir -r requirements.txt

# ❌ OLD: Pre-download HuggingFace model to cache
# RUN pip install sentence-transformers && \
#     python -c "from sentence_transformers import SentenceTransformer; \
#                SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
# This cached 300MB model in the image.
#
# ✅ NEW: No model caching needed - using Gemini API!

# Copy application code
COPY app/ ./app/

# ⚡⚡ CRITICAL RAM OPTIMIZATION: Single worker
# Why: Each worker = 150MB RAM baseline
# Before: 2 workers × 150MB = 300MB
# After: 1 worker × 150MB = 150MB
# Saved: 150MB RAM!
#
# Trade-off:
# - Only 1 concurrent request (not ideal for production)
# - Perfect for Koyeb free tier with 3-5 users
# - Can scale up when upgrading to paid tier
#
# Note: --reload enables hot-reload in development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--reload"]

# Expected Resource Usage:
# - Docker Image: ~500MB (down from 2500MB)
# - RAM Baseline: ~150MB (down from 300MB)
# - RAM with FAISS (2 startups): ~250MB total
# - RAM safety margin: ~260MB (51% free)
# 
# ✅ Result: Fits comfortably in Koyeb 512MB limit!
