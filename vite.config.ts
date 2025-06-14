import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@appRoutes": path.resolve(__dirname, "./static/appRoutes"),
        "@pages": path.resolve(__dirname, "./static/pages"),
        "@components": path.resolve(__dirname, "./static/components"),
        "@libs": path.resolve(__dirname, "./static/libs"),
        "@trpcClient": path.resolve(__dirname, "./static/trpcClient"),
        "@common": path.resolve(__dirname, "./common"),
        "@css": path.resolve(__dirname, "./static/css"),
      },
    },
    base: "",
    server: {
      port: 3000,
    },
    build: {
      outDir: "build",
      minify: "esbuild"
    },
    define: {
      "process.env": env,
    },
  };
});
