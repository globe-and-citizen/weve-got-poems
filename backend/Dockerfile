# Dockerfile for Node Express backend 
FROM node:18.2.0-alpine as development


# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./package-lock.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Command to run your Node.js application
CMD ["npm", "run", "start"]

# Expose the port in the environement variable 
EXPOSE 8000

# Stage 1: Build the application
# FROM node:18.2.0-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci --only=production

# COPY . .

# RUN npm run build

# # Stage 2: Create a lightweight image
# FROM node:18.2.0-alpine

# WORKDIR /app

# # Create a non-root user
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# # Copy necessary files from the builder stage
# COPY --from=builder /app/dist /app/dist
# COPY --from=builder /app/package.json /app/package.json
# COPY --from=builder /app/node_modules /app/node_modules

# # Change to non-root user
# USER appuser

# EXPOSE 3000

# CMD ["npm", "start"]