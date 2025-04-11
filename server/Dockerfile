# Use official Node.js image
FROM node:18

# Install Python3 & pip (required for yt-dlp)
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip install --no-cache-dir yt-dlp --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy rest of your app
COPY . .

# Expose app port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
