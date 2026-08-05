FROM python:3.9-slim

# Install system dependencies required for GeoPandas and OpenCV
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PyTorch CPU version to save space
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# Expose the port (Hugging Face routes port 7860 by default)
EXPOSE 7860

# We need to override the hardcoded 5010 port in server.py
# by running it via Gunicorn or passing an env var. We will just use sed to change it.
RUN sed -i 's/port = 5010/port = 7860/g' server.py
RUN sed -i 's/host = '\''127.0.0.1'\''/host = '\''0.0.0.0'\''/g' server.py

# Run the Flask app
CMD ["python", "server.py"]
