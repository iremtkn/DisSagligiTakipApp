# Node.js ortamını kullan
FROM node:20-alpine

WORKDIR /app

# Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Proje dosyalarını kopyala
COPY . .

# Projeyi derle
RUN npm run build

# Uygulamayı 3000 portunda başlat
EXPOSE 3000
CMD ["npm", "start"]