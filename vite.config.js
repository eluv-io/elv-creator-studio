import { defineConfig, splitVendorChunkPlugin } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath, URL } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react-swc";
import ViteYaml from "@modyfi/vite-plugin-yaml";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    ViteYaml(),
    nodePolyfills({
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        fs: "memfs",
      },
    }),
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
    alias: {
      "@/assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@/components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@/helpers": fileURLToPath(new URL("./src/helpers", import.meta.url)),
      "@/pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@/specs": fileURLToPath(new URL("./src/specs", import.meta.url)),
      "@/stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
    }
  },
  build: {
    manifest: true
  }
});
