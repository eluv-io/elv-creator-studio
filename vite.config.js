import { defineConfig, splitVendorChunkPlugin } from "vite";
import { fileURLToPath, URL } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react-swc";
import ViteYaml from "@modyfi/vite-plugin-yaml";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    ViteYaml(),
    viteStaticCopy({
      targets: [
        {
          src: "configuration.js",
          dest: ""
        }
      ]
    })
  ],
  server: {
    port: 9000,
    host: true
  },
  resolve: {
    // Synchronize with jsonconfig.json
    alias: [
      { find: "@/assets", replacement: fileURLToPath(new URL("./src/assets", import.meta.url)) },
      { find: "@/components", replacement: fileURLToPath(new URL("./src/components", import.meta.url)) },
      { find: "@/helpers", replacement: fileURLToPath(new URL("./src/helpers", import.meta.url)) },
      { find: "@/pages", replacement: fileURLToPath(new URL("./src/pages", import.meta.url)) },
      { find: "@/specs", replacement: fileURLToPath(new URL("./src/specs", import.meta.url)) },
      { find: "@/stores", replacement: fileURLToPath(new URL("./src/stores", import.meta.url)) },
    ]
  },
  build: {
    manifest: true
  }
});
