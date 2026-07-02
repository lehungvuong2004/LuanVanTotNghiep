FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm config set registry https://registry.npmmirror.com && \
    npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
