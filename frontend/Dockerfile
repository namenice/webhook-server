# Stage 1: Build the React application with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This step is done separately to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite project for production
# Assuming 'npm run build' generates files into a 'dist' directory
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Remove default Nginx HTML folder content
RUN rm -rf /etc/nginx/html

# Copy the built application from the builder stage to Nginx's public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Command to start Nginx (default command for nginx:alpine)
CMD ["nginx", "-g", "daemon off;"]

