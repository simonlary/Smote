FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/out out
CMD [ "node", "out/index.js" ]
