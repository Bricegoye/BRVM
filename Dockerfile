FROM python:3.13-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install -r requirements.txt

COPY main.py .
COPY collector/ ./collector/
COPY config/ ./config/
COPY database/ ./database/
COPY models/ ./models/
COPY services/ ./services/
COPY utils/ ./utils/

RUN mkdir -p /app/logs /app/data

CMD ["python", "main.py"]