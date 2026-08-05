FROM node:20-alpine

WORKDIR /app

# 1. Copie des fichiers de configuration
COPY package*.json ./

# 2. Installation des dépendances (crucial pour installer 'pg')
RUN npm install

# 3. Copie du code source
COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "start"]