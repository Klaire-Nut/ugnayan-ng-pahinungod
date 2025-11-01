# Use Node 18 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose the app port (Vite default 5173)
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev"]
