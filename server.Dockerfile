# Stage 1: Frontend
FROM node:20.11.1 AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend source code
COPY ./frontend /app/frontend/

# Install frontend dependencies
RUN npm install

# Build frontend for production
RUN npm run build:docker

# Stage 2: Backend
FROM node:20.11.1 AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend source code
COPY ./backend /app/backend

# Install backend dependencies
RUN npm install

# Build backend
RUN npm run build

# Stage 3: Final Image
FROM node:20.11.1

# Copy built frontend and backend from previous stages to the final image
COPY --from=frontend-build /app/frontend/dist /app/backend/dist
COPY --from=backend-build /app/backend/dist /app/backend/dist

# Expose port for the backend
EXPOSE 8000

# Command to run the backend server
CMD ["npm", "start", "--prefix", "/app/backend"]
