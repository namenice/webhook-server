import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // เพิ่มบรรทัดนี้
    port: 5173,      // (Optional) คุณสามารถระบุ port ที่ต้องการได้
  }
})
