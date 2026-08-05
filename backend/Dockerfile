FROM node:20-alpine

WORKDIR /app

# Copie du package.json (si présent) et des sources
COPY package*.json ./
COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/server.js"]