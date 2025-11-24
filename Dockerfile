# Use a compatible Node.js version as the base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Run the application with IPv4 binding
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
