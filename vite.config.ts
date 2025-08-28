// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // A configuração agora é uma função que verifica o comando em execução
  
  if (command === 'serve') {
    // Comando 'serve' é usado por 'npm run dev'
    return {
      plugins: [react()],
      base: '/', // Para desenvolvimento local, usamos o caminho raiz
    }
  } else {
    // Qualquer outro comando (como 'build') usará a configuração de produção
    return {
      plugins: [react()],
      base: '/sistema-de-afiliados-poc/', // Para o build final, usamos o caminho do repositório
    }
  }
})