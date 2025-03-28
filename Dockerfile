# Official Node.js runtime as a parent image
FROM node:18-alpine

# Working directory inside the container
WORKDIR /app

# Package.json and package-lock.json first (to optimize Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application files
COPY . .

# The application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
