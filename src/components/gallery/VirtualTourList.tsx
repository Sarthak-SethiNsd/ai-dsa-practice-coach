"use client";

import * as React from "react";
import { VirtualTour, GalleryItem } from "@/services/gallery/galleryTypes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Play, Clock, Layers, Compass } from "lucide-react";

interface VirtualTourListProps {
  tours: VirtualTour[];
  galleryItems: GalleryItem[];
  onStartTour: (tour: VirtualTour) => void;
}

export function VirtualTourList({
  tours,
  galleryItems,
  onStartTour,
}: VirtualTourListProps) {
  const itemMap = React.useMemo(() => {
    return new Map(galleryItems.map((item) => [item.id, item]));
  }, [galleryItems]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white border border-sky-800/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Interactive Visual Tours
          </div>
          <h2 className="text-xl font-bold">Guided Conceptual Walkthroughs</h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Step through curated visual sequences with AI coach commentary, invariant deep dives, and auto-play walkthroughs.
          </p>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => {
          const coverItem = itemMap.get(tour.coverItemId);

          return (
            <Card
              key={tour.id}
              className="flex flex-col overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Tour Cover Diagram Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-slate-100 flex items-center justify-center p-2">
                {coverItem ? (
                  <div
                    className="w-full h-full flex items-center justify-center opacity-90"
                    dangerouslySetInnerHTML={{ __html: coverItem.svgContent }}
                  />
                ) : (
                  <div className="text-slate-500 text-xs">Guided Walkthrough</div>
                )}

                {/* Target Audience Pill */}
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-sky-300 text-[11px] font-semibold backdrop-blur-sm border border-slate-700/60">
                  {tour.targetAudience}
                </span>
              </div>

              {/* Tour Content */}
              <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      {tour.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{tour.estimatedMinutes} mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {tour.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tour.description}
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onStartTour(tour)}
                  className="w-full gap-2 cursor-pointer shadow-sm shadow-sky-500/10"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Guided Tour
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
