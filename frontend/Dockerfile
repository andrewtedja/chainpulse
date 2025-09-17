
FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install --include=optional --legacy-peer-deps && npm rebuild lightningcss

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]