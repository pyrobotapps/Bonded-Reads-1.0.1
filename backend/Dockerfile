# Dockerfile
FROM python:3.11-slim

# wORKING DIRECTORY
WORKDIR /app

# DEPENDENCIES
COPY requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# COPY FILES
COPY . .

# PORT EXPOSURE
EXPOSE 8080

# START FASTAPI
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]