import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FMA SPORT",
    short_name: "FMA SPORT",
    description: "FMA SPORT (FMASPORT), le média qui vit le foot.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#18181b",
    lang: "fr",
    icons: [{ src: "/icon.jpg", sizes: "any", type: "image/jpeg" }],
  };
}
