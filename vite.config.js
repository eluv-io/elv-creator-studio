import { defineConfig, splitVendorChunkPlugin, transformWithEsbuild } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath, URL } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react-swc";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import svgLoader from 'vite-svg-loader'

export default defineConfig(({command}) => {
  let plugins = [
    react(),
    splitVendorChunkPlugin(),
    ViteYaml(),
    svgLoader({defaultImport: "url"}),
    viteStaticCopy({
      targets: [
        {
          src: "configuration.js",
          dest: ""
        }
      ]
    }),
    {
      name: "treat-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))  return null;

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
  ];

  if(command !== "serve") {
    plugins.push(
      nodePolyfills({
        overrides: {
          // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
          // - fs is needed to build csstree-validator
          fs: "memfs",
        },
      })
    );
  }

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
        "Assets": fileURLToPath(new URL("./src/pages/media_properties/builder/wallet/assets", import.meta.url)),
        "Components": fileURLToPath(new URL("./src/pages/media_properties/builder/wallet/components", import.meta.url)),
        "Stores": fileURLToPath(new URL("./src/pages/media_properties/builder/wallet/stores", import.meta.url)),
        "Client": fileURLToPath(new URL("./src/pages/media_properties/builder/wallet/client", import.meta.url)),
        "mobx-react" : "mobx-react-lite",
      }
    },
    build: {
      manifest: true
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    }
  };
});
