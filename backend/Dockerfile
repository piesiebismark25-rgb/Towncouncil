# Use official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create data directory and ensure proper permissions for the non-root node user
RUN mkdir -p data && chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose the backend port
EXPOSE 5000

# Define environment variables with defaults
ENV PORT=5000 \
    NODE_ENV=production \
    JWT_SECRET=supersecretkey_change_me_in_production

# Run the backend application
CMD ["node", "server.js"]
