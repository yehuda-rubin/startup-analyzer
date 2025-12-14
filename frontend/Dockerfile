FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install react-markdown


COPY public/ ./public/
COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "start"]