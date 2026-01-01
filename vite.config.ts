import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
      'process.env.SILICONFLOW_API_KEY': JSON.stringify(env.VITE_SILICONFLOW_API_KEY),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY),
    },
  }
})