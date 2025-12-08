# Use Node 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# Copy all files
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev"]
