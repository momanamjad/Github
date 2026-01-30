import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
      content: ["./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
        "./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        
        github: {
          
          bg: "#0d1117",
          panel: "#161b22",
          panelHover: "#1f242c",
          border: "#30363d",
          text: "#c9d1d9",
          muted: "#8b949e",
          link: "#58a6ff",
          green: "#238636",
          orange: "#f78166",
        },
      },
    },
  },
  
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
