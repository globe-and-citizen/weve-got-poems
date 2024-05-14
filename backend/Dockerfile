# Use an official Node.js runtime as the base image
FROM node:18.2.0-alpine

# Define build-time argument
ARG EXTERNAL_DB_URL

# Set environment variable
ENV EXTERNAL_DB_URL=${EXTERNAL_DB_URL}

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Command to run your Node.js application
CMD ["npm", "run", "start"]

# Expose the port the app runs on
EXPOSE 8000
