FROM node:alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Dev stage - don't include prebuilt JS
FROM node:alpine AS dev
WORKDIR /app
RUN mkdir /app/temp && apk add --no-cache curl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "dev"]

FROM node:alpine AS runner
WORKDIR /app
RUN mkdir /app/temp && apk add --no-cache curl
COPY --from=deps /app .
CMD ["node", "dist/app.js"]