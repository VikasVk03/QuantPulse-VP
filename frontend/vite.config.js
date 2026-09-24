import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const backendTarget = env.VITE_BACKEND_URL || env.VITE_API_BASE_URL || "http://localhost:8000";
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "."),
            },
        },
        server: {
            port: 5173,
            proxy: {
                "/api": {
                    target: backendTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
