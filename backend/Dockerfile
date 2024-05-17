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
EXPOSE $PORT

# Stage 1: Build the application
# FROM node:18.2.0-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci --only=production

# COPY . .