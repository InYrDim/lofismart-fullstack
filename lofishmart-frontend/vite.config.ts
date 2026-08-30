import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite(),
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["lofish.svg"],
			manifest: {
				name: "LoFish Mart",
				short_name: "LoFish",
				description: "Aplikasi kasir & manajemen toko LoFish Mart",
				theme_color: "#0094c6",
				background_color: "#ffffff",
				display: "standalone",
				start_url: "/",
				icons: [
					{
						src: "lofish.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
			},
		}),
	],
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
