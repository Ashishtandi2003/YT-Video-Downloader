# Use official Node.js image
FROM node:18

# Install Python3 & yt-dlp with minimal deps
RUN apt-get update && \
    apt-get install -y python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy the rest of the server code
COPY server ./server

# Set working directory to server
WORKDIR /app/server

# Expose backend port
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
