import { defineConfig, splitVendorChunkPlugin } from "vite"
import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  server: {
    port: 9000,
    host: true
  },
  define: {
    global: "({})",
    process: {}
  },
  resolve: {
    // Synchronize with jsonconfig.json
    alias: [
      { find: "Assets", replacement: fileURLToPath(new URL("./src/static", import.meta.url)) },
      { find: "Components", replacement: fileURLToPath(new URL("./src/components", import.meta.url)) },
      { find: "Stores", replacement: fileURLToPath(new URL("./src/stores", import.meta.url)) },
    ]
  },
  build: {
    manifest: true
  }
})
