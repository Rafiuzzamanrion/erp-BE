FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json ./
COPY src/ ./src/
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
RUN yarn install --frozen-lockfile --production
EXPOSE 5000
CMD ["node", "dist/server.js"]
