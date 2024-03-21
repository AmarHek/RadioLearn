# Stage 1: Frontend
FROM node:20.11.1 AS frontend-build

# Set working directory for frontend
WORKDIR /frontend

# Copy frontend source code
COPY ./frontend /frontend/

# Install frontend dependencies
RUN npm install

# Build frontend for production
RUN npm run build

# Stage 2: Backend
FROM node:20.11.1 AS backend-build

# Set working directory for backend
WORKDIR /backend

# Copy backend source code
COPY ./backend /backend

# Install backend dependencies
RUN npm install

# Build backend
RUN npm run build

# Stage 3: Final Image
FROM node:20.11.1

WORKDIR /app

# Copy built frontend and backend from previous stages to the final image
COPY --from=backend-build /backend/* /app/
COPY --from=frontend-build /frontend/dist /app/dist

# Expose port for the server
EXPOSE 8000

# Command to run the backend server
CMD ["node", "/app/dist/server.js"]
