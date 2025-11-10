# Use Node 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Make sure vite can be executed
RUN chmod +x node_modules/.bin/vite

# Build the app (production build)
RUN npm run build

# Expose the Vite dev server port
EXPOSE 5173

# Run the development server (or change to "serve" if using a built version)
CMD ["npm", "run", "dev"]
