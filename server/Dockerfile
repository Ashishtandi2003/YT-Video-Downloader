# Use official Node.js image
FROM node:18

# Install Python3 & yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip install --no-cache-dir yt-dlp --break-system-packages

# Set working dir
WORKDIR /app

# Copy server code
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy rest of server files
COPY server ./server

# Set working dir to server folder
WORKDIR /app/server

# Expose server port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
