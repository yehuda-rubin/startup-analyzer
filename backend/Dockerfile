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
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]