# Estágio 1: Build (Pode ser feito localmente ou aqui)
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Servidor de Produção (Agora usando Node.js para suportar a API)
FROM node:20-alpine as production-stage
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/package*.json ./
RUN npm install --production

EXPOSE 8080
CMD ["node", "server.js"]
