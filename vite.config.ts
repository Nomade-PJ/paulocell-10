import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações para evitar erros de memória
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Desabilitar sourcemaps em produção
    sourcemap: mode === 'development',
    // Usar terser para minificação melhorada
    minify: 'terser',
    terserOptions: {
      compress: {
        // Reduzir uso de memória durante a minificação
        keep_infinity: true,
        passes: 1,
      },
    },
    // Dividir chunks para arquivos menores
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            // outros componentes UI podem ser adicionados aqui
          ],
          // Separar bibliotecas grandes
          chart: ['chart.js', 'react-chartjs-2'],
          utils: ['date-fns', 'axios', 'zod']
        },
        // Limitar o tamanho dos chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    // Reduzir uso de memória durante o build
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Desabilitar algumas otimizações caras em termos de memória
    modulePreload: false,
    reportCompressedSize: false,
  },
  // Configurações de otimização para resolver problemas específicos do Node.js 22
  optimizeDeps: {
    // Incluir dependências críticas para pré-bundling
    include: [
      'react', 
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios'
    ],
    // Excluir dependências problemáticas
    exclude: [
      // Adicione bibliotecas problemáticas aqui, se necessário
    ]
  },
}));
