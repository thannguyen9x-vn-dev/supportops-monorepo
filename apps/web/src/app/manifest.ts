import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ServiceOps",
    short_name: "ServiceOps",
    description: "SupportOps Service Operations Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF2F7",
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
