export type GalleryCategory =
  | "data_structures"
  | "algorithm_patterns"
  | "cheatsheets"
  | "system_architecture";

export interface GalleryItem {
  id: string;
  slug: string;
  title: string;
  category: GalleryCategory;
  description: string;
  detailedNotes: string[];
  svgContent: string;
  aspectRatio: "16/9" | "4/3" | "1/1";
  altText: string;
  topics: string[];
  difficulty?: "Easy" | "Medium" | "Hard";
  relatedSkillNodeId?: string;
  relatedProblemId?: number;
  createdAt: string;
}

export interface VirtualTourStep {
  stepNumber: number;
  galleryItemId: string;
  headline: string;
  narration: string;
  keyTakeaways: string[];
  actionPrompt?: string;
}

export interface VirtualTour {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: GalleryCategory;
  estimatedMinutes: number;
  coverItemId: string;
  steps: VirtualTourStep[];
  targetAudience: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
}

export interface GalleryFilterOptions {
  category: GalleryCategory | "all";
  searchQuery: string;
  topic: string | null;
  favoritesOnly: boolean;
}
