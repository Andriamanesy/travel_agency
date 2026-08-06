FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des modules (uniquement 'pg')
RUN npm install --production

# Copie du code source
COPY src/ ./src/
COPY templates/ ./templates/

# Répertoires persistants montés sous /app/public/uploads par Docker Compose.
RUN mkdir -p /app/public/uploads/users /app/public/uploads/destinations /app/public/uploads/circuits /app/public/uploads/banners /app/public/uploads/guides

EXPOSE 3000

CMD ["npm", "start"]
