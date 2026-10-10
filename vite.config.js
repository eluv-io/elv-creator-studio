import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import ViteYaml from "@modyfi/vite-plugin-yaml";

export default defineConfig(({command}) => {
  let plugins = [
    react(),
    ViteYaml(),
    viteStaticCopy({
      targets: [
        {
          src: "configuration.js",
          dest: ""
        }
      ]
    })
  ];

  return {
    plugins,
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
        "@/migrations": fileURLToPath(new URL("./src/migrations", import.meta.url)),
        "@/pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "@/specs": fileURLToPath(new URL("./src/specs", import.meta.url)),
        "@/stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      }
    },
    build: {
      manifest: true
    }
  };
});
