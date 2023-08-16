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
      { find: "Assets", replacement: fileURLToPath(new URL("./src/static", import.meta.url)) },
      { find: "Components", replacement: fileURLToPath(new URL("./src/components", import.meta.url)) },
      { find: "Helpers", replacement: fileURLToPath(new URL("./src/helpers", import.meta.url)) },
      { find: "Pages", replacement: fileURLToPath(new URL("./src/pages", import.meta.url)) },
      { find: "Specs", replacement: fileURLToPath(new URL("./src/specs", import.meta.url)) },
      { find: "Stores", replacement: fileURLToPath(new URL("./src/stores", import.meta.url)) },
    ]
  },
  build: {
    manifest: true
  }
});
