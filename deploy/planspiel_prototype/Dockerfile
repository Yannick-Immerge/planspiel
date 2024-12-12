# Use an official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy only package.json and package-lock.json (or yarn.lock)
COPY web_apps/planspiel-prototype/package.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY ./web_apps/planspiel-prototype .

# Build the Next.js application
RUN yarn build

# Install only production dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Use a minimal Node.js runtime image for the final stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the built application and node_modules from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Command to start the application
CMD ["yarn", "start"]