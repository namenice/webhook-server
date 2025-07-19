# ---------- Stage 1 : ติดตั้ง dependency ลงเลเยอร์แยก ----------
FROM node:20-alpine AS deps
WORKDIR /app

# คัดลอกไฟล์ manifest แล้วติดตั้ง production deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2 : ภาพจริงสำหรับรันโปรดักชัน ----------
FROM node:20-alpine
WORKDIR /app

# คัดลอกโค้ด + node_modules จาก stage ก่อนหน้า
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY .env.example ./

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/index.js"]
