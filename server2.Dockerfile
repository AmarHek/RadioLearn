# Use lightweight Node image
FROM node:20.11.1

# Set working directory
WORKDIR /app

# Copy package.json files
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

# Install dependencies
RUN npm install --prefix frontend
RUN npm install --prefix backend

# Copy frontend dist files
COPY frontend/dist ./backend/dist

# Expose port
EXPOSE 3000

# Start command
# CMD ["npm", "start", "--prefix", "/app/backend"]
CMD ["node", "-r", "ts-node/register", "app/backend/src/server.ts"]
