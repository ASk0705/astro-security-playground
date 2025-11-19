import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { squooshImageService } from "astro/assets/services/squoosh"; // ✅ ADD THIS

export default defineConfig({
  output: "server",
  image: {
    service: squooshImageService(), // ✅ FIX
  },
  adapter: cloudflare(),
});
