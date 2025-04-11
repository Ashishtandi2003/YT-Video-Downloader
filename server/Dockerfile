# Use official Node.js image
FROM node:18

# Install Python3 & yt-dlp with minimal deps
RUN apt-get update && \
    apt-get install -y python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server/server.js"]
