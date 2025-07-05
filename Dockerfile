FROM node:22

WORKDIR /app

COPY package.json .

COPY package-lock.json .

COPY tsconfig.json .

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 5000

CMD [ "npm", "start" ]