FROM node:alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:alpine AS runner
WORKDIR /app
COPY --from=deps /app .
CMD ["node", "dist/app.js"]