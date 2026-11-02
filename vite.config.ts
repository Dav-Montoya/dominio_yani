import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// plugins = "extras" que Vite usa al compilar:
//  - react()       -> le enseña a Vite a entender JSX / TSX
//  - tailwindcss() -> activa Tailwind (AGREGADO respecto al ejemplo del profe)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
