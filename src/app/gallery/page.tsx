import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/GalleryView";

export const metadata: Metadata = {
  title: "Visual Gallery & Virtual Tours · DSA AI Coach",
  description: "Explore interactive algorithmic flowcharts, data structure memory models, and guided conceptual tours.",
};

export default function GalleryPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <GalleryView />
    </main>
  );
}
