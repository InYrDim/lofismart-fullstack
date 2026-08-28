import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [TanStackRouterVite(), react(), tailwindcss()],
  server: {
    allowedHosts: ["sikan.iyetest.my.id", "lofish.iyetest.my.id"]
  },
	// no need for proxy because already had backend on
	// server: {
	// 	proxy: {
	// 		"/api": {
	// 			target: "http://lofish.monlab.my.id",
	// 			changeOrigin: true,
	// 			rewrite: (path) => path.replace(/^\/api/, ""),
	// 		},
	// 		"/xendit-api": {
	// 			target: "https://api.xendit.co",
	// 			changeOrigin: true,
	// 			rewrite: (path) => path.replace(/^\/xendit-api/, ""),
	// 		},
	// 	},
	// },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
