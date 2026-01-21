import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/one-year-harvests/',
    plugins: [react()],
    build: {
        target: 'es2015'
    }
})
