FROM python:3.11-slim

WORKDIR /app

# התקנת כלי מערכת + התיקון הקריטי ל-FAISS (libgomp1)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# התקנת החבילות
# ⚡ Much faster now - no torch/transformers downloads!
# Old image size: ~2500 MB
# New image size: ~500 MB
RUN pip install --no-cache-dir -r requirements.txt

# ❌ REMOVED: Local model download (not needed with Gemini Embeddings API)
# Reason: We use cloud-based embeddings, no local model required
# This was downloading 80MB model + initializing torch (800MB)
# Old code (commented out):
# RUN pip install sentence-transformers && \
#     python -c "from sentence_transformers import SentenceTransformer; \
#                SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]