# Use Node.js 18 (full version, not Alpine)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
