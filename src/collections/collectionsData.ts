// src/collections/collectionsData.ts - PROFESSIONAL MEDIA MANAGEMENT SOLUTION

export interface Collection {
  id: string;
  title: string;
  description: string;
  images: Array<{ full: string; thumb: string }>;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  timestamp: string;
  likes: number;
  comments: number;
  type: "single-media" | "collage" | "video" | "double-media" | "collection";
  price?: number; // Price in USD, undefined = free
  cardLayout: {
    gridType: "single" | "double" | "triple" | "quad" | "masonry" | "asymmetric";
    maxImages: number;
    gridClasses?: string;
    imageSpans?: { [key: number]: string };
  };
}

const demoAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face";

const buildRemotePlaceholders = (variant: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    full: `https://picsum.photos/seed/${variant}-${i + 1}/1600/1200`,
    thumb: `https://picsum.photos/seed/${variant}-thumb-${i + 1}/400/300`,
  }));

export const collections: Record<string, Collection> = {
  "1": {
    id: "1",
    title: "Skyline Studies",
    description: "Concept shots exploring moody skylines, neon reflections, and fog layers.",
    images: buildRemotePlaceholders("skyline", 8),
    user: { name: "Creator Premium", avatar: demoAvatar, verified: true },
    timestamp: "This week",
    likes: 1200,
    comments: 24,
    type: "collage",
    cardLayout: { gridType: "triple", maxImages: 3, gridClasses: "grid grid-cols-3 gap-1 h-full" },
  },
  "2": {
    id: "2",
    title: "Nature Panels",
    description: "Wide shots of forests, rivers, and macro leaves to storyboard outdoor moods.",
    images: buildRemotePlaceholders("nature", 7),
    user: { name: "Creator Premium", avatar: demoAvatar, verified: true },
    timestamp: "2 days ago",
    likes: 980,
    comments: 18,
    type: "collection",
    cardLayout: {
      gridType: "masonry",
      maxImages: 4,
      gridClasses: "grid grid-cols-3 gap-1 h-full",
      imageSpans: { 0: "col-span-2" },
    },
  },
  "3": {
    id: "3",
    title: "Product Texture Grid",
    description: "Closeups of stone, glass, metal and fabric to pair with UI motion cues.",
    images: buildRemotePlaceholders("texture", 10),
    user: { name: "Creator Premium", avatar: demoAvatar, verified: true },
    timestamp: "Yesterday",
    likes: 1440,
    comments: 32,
    type: "collection",
    cardLayout: {
      gridType: "asymmetric",
      maxImages: 5,
      gridClasses: "grid grid-cols-3 grid-rows-2 gap-1 h-full",
      imageSpans: { 0: "col-span-2" },
    },
  },
  "4": {
    id: "4",
    title: "Fictional Living",
    description: "Apartment mock scenes with soft lighting, cozy props, and vignette details.",
    images: buildRemotePlaceholders("interior", 9),
    user: { name: "Creator Premium", avatar: demoAvatar, verified: true },
    timestamp: "3 days ago",
    likes: 860,
    comments: 15,
    type: "double-media",
    cardLayout: { gridType: "quad", maxImages: 6, gridClasses: "grid grid-cols-2 grid-rows-2 gap-1 h-full" },
  },
  "5": {
    id: "5",
    title: "Night Market Story",
    description: "Candid angles of street vendors, steam, and signage to inspire atmosphere.",
    images: buildRemotePlaceholders("market", 8),
    user: { name: "Creator Premium", avatar: demoAvatar, verified: true },
    timestamp: "This month",
    likes: 1010,
    comments: 20,
    type: "collection",
    cardLayout: {
      gridType: "masonry",
      maxImages: 5,
      gridClasses: "grid grid-cols-3 gap-1 h-full",
      imageSpans: { 1: "col-span-2" },
    },
  },
  "6": {
    id: "6",
    title: "Mock Campaign Tiles",
    description: "Concept tiles that pair abstract imagery with short captions to outline story beats.",
    images: buildRemotePlaceholders("campaign", 9),
    user: { name: "Demo Creator", avatar: demoAvatar, verified: true },
    timestamp: "Last week",
    likes: 1320,
    comments: 27,
    type: "collection",
    cardLayout: {
      gridType: "asymmetric",
      maxImages: 6,
      gridClasses: "grid grid-cols-3 grid-rows-3 gap-1 h-full",
      imageSpans: { 0: "col-span-2 row-span-2" },
    },
  },
};

export const getCollection = (id: string): Collection | undefined => {
  return collections[id];
};

export const getAllCollectionIds = (): string[] => {
  return Object.keys(collections);
};

export const getCollectionsByType = (type: string): Collection[] => {
  return Object.values(collections).filter(collection => collection.type === type);
};

export const getRandomCollections = (count: number = 5): Collection[] => {
  const allCollections = Object.values(collections);
  const shuffled = allCollections.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const searchCollections = (query: string): Collection[] => {
  const searchTerm = query.toLowerCase();
  return Object.values(collections).filter(collection =>
    collection.title.toLowerCase().includes(searchTerm) ||
    collection.description.toLowerCase().includes(searchTerm)
  );
};

export const getPostCollectionImages = (postId: string): Array<{ full: string; thumb: string }> => {
  const collection = getCollection(postId);
  return collection ? collection.images : [];
};