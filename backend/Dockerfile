# ---------- Stage 1 : ติดตั้ง dependency ลงเลเยอร์แยก ----------
FROM node:20-alpine AS deps
WORKDIR /app

# คัดลอกไฟล์ manifest แล้วติดตั้ง production deps
COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev

# ---------- Stage 2 : ภาพจริงสำหรับรันโปรดักชัน ----------
FROM node:20-alpine
WORKDIR /app

# ไม่ต้องสร้าง user ใหม่ เพราะ node:alpine มี user 'node' (UID/GID 1000) อยู่แล้ว
# RUN addgroup --gid 1000 nodeuser && adduser -u 1000 -G nodeuser -s /bin/sh -D nodeuser

# คัดลอกโค้ด + node_modules จาก stage ก่อนหน้า
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY .env.example ./

# เปลี่ยนเจ้าของของ /app directory ให้เป็น user 'node'
# ซึ่งจะทำให้ user 'node' มีสิทธิ์เขียนไฟล์ใน /app ได้
RUN chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 4000

# กำหนดให้ Container รันด้วย user 'node' แทน root
USER node

CMD ["node", "src/index.js"]

