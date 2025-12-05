// Maps collection IDs to secure identifiers

export const secureIdMap: Record<string, string> = {
  "1": "42857194638", // Golden Sun
  "2": "91673248507", // Nature's Bloom
  "3": "53928416752", // Crimson Mystery
  "4": "78451392684", // Beige Bliss
  "5": "26849173560", // Cowgirl Dreams
  "6": "64937582104", // Ocean Waves
  "7": "15782639408", // Velvet Desire
  "8": "89264537219", // Inner Peace
  "9": "37196845273", // Shadow Play
  "10": "52814769380", // Scarlet Seduction
  "11": "94167238501", // Cozy Pink
  "12": "61395748026", // Body Appreciation
  "13": "48726193405", // Gallery Muse
  "14": "73048261957", // Pure White
  "15": "25913784650", // Midnight Black
  "16": "86257403921", // Cozy Life
  "17": "14539872640", // Daily Moments & Exclusive Posts
};

// Special secure IDs for special pages
export const specialSecureIds = {
  COLLECTIONS: "83946217508425", // Collections page secure ID
};

// Reverse mapping for lookups
export const reverseSecureIdMap: Record<string, string> = Object.fromEntries(
  Object.entries(secureIdMap).map(([key, value]) => [value, key])
);

// Add special IDs to reverse mapping (these don't have collection IDs)
Object.entries(specialSecureIds).forEach(([key, value]) => {
  reverseSecureIdMap[value] = `SPECIAL_${key}`;
});

// Helper functions
export const getSecureId = (collectionId: string): string => {
  return secureIdMap[collectionId] || "";
};

export const getCollectionId = (secureId: string): string => {
  return reverseSecureIdMap[secureId] || "";
};

// Validate if a secure ID exists
export const isValidSecureId = (secureId: string): boolean => {
  return secureId in reverseSecureIdMap;
};

// Check if secure ID is for collections page
export const isCollectionsSecureId = (secureId: string): boolean => {
  return secureId === specialSecureIds.COLLECTIONS;
};

// Generate a new secure ID (for future collections)
export const generateSecureId = (): string => {
  let newId;
  do {
    newId = Math.floor(10000000000 + Math.random() * 90000000000).toString();
  } while (newId in reverseSecureIdMap);
  return newId;
};
