# Use an official Node.js runtime as the base image
FROM node:18.2.0-alpine as development

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./package-lock.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Copy the .env file
COPY .env .env

# Command to run your Node.js application
CMD ["npm", "run", "dev"]

EXPOSE 9000

FROM node:18-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY --from=development /app/package.json /app/package-lock.json ./

# Copy the rest of the application code
COPY --from=development /app .

# Build Vue app
RUN npm run build

# Use nginx base image for serving Vue app
FROM nginx:latest as production

# Expose port (default is 80 for nginx)

#COPY ./docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy built app from build-stage to nginx server
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Command to start nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]