# Argo Jupyter Notebook Environment
# Provides a containerized environment for running Argo tutorials

FROM node:22-bookworm

# Install Python and Jupyter
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Jupyter
RUN pip3 install --break-system-packages jupyter notebook

# Install tslab (TypeScript kernel for Jupyter)
RUN npm install -g tslab

# Set working directory
WORKDIR /workspace

# Copy package files
COPY package*.json ./
COPY packages/argo-core/package*.json ./packages/argo-core/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Register tslab with Jupyter
RUN tslab install --python=python3

# Expose Jupyter port
EXPOSE 8888

# Start Jupyter
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''", "--NotebookApp.password=''"]
