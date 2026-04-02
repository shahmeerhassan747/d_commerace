FROM python:3.11-slim

# Keep Python output predictable and avoid writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system build deps for some Python packages (psycopg2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first for better layer caching
COPY requirements.txt /app/requirements.txt

RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install -r /app/requirements.txt

# Copy project
COPY . /app

EXPOSE 8000

# Default command for development; override as needed
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
