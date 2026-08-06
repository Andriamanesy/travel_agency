FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des modules (uniquement 'pg')
RUN npm install --production

# Copie du code source
COPY src/ ./src/

# Répertoire de destination des avatars (également vérifié à chaque upload).
RUN mkdir -p /app/public/uploads/avatars

EXPOSE 3000

CMD ["npm", "start"]
