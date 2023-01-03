FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
COPY . .
CMD npm start