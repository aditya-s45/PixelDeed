FROM python:3.10-slim

# Install system dependencies for GDAL, OpenCV, and git
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL config
ENV GDAL_CONFIG=/usr/bin/gdal-config

WORKDIR /app

# Install PyTorch CPU-only (saves ~1.5GB vs full CUDA build)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the HQ-SAM model weights (~2.5GB) during build
# so the container starts instantly at runtime
RUN mkdir -p /root/.cache/torch/hub/checkpoints && \
    python -c "import urllib.request; urllib.request.urlretrieve('https://huggingface.co/lkeab/hq-sam/resolve/main/sam_hq_vit_h.pth', '/root/.cache/torch/hub/checkpoints/sam_hq_vit_h.pth')"

# Copy all server code
COPY . .

# Create temp directories
RUN mkdir -p /app/temp/imagery /app/temp/segmentation

# Hugging Face Spaces requires port 7860
EXPOSE 7860

CMD ["python", "server.py"]
