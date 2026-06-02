FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci
COPY src ./src/
RUN mkdir -p uploads
EXPOSE 3000
CMD ["npx", "tsx", "watch", "src/index.ts"]
