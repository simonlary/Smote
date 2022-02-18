FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/out out
COPY --from=builder /app/gods.json ./
CMD [ "node", "out/index.js" ]
