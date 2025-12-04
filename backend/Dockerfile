FROM node:20-alpine

WORKDIR /app/backend

# Copy package files
COPY backend/package.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY backend/ ./

EXPOSE 5000

CMD ["npm", "run", "dev"]

