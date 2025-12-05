import { getSecureId } from "./secureIdMapper";

// Collections secure ID
const COLLECTIONS_SECURE_ID = "83946217508425";

// Helper function to generate secure post URLs (only for full access)
export const getSecurePostUrl = (collectionId: string): string => {
  const secureId = getSecureId(collectionId);
  if (!secureId) {
    console.warn(`No secure ID found for collection ID: ${collectionId}`);
    return `/post/${collectionId}`;
  }
  
  return `/post/${secureId}`;
};

// Helper function to generate blurred URL (uses simple ID)
export const getBlurredPostUrl = (collectionId: string): string => {
  return `/post-blurred/${collectionId}`;
};

// Helper function to generate secure collections URL
export const getSecureCollectionsUrl = (): string => {
  return `/collections/${COLLECTIONS_SECURE_ID}`;
};

// Helper function for post navigation
export const navigateToSecurePost = (collectionId: string, navigate: Function) => {
  const secureUrl = getSecurePostUrl(collectionId);
  navigate(secureUrl);
};

export const navigateToBlurredPost = (collectionId: string, navigate: Function) => {
  const blurredUrl = getBlurredPostUrl(collectionId);
  navigate(blurredUrl);
};

// Helper function for collections navigation
export const navigateToSecureCollections = (navigate: Function) => {
  const secureUrl = getSecureCollectionsUrl();
  navigate(secureUrl);
};

// Helper function to extract collection ID from current URL
export const getCollectionIdFromUrl = (pathname: string): string | null => {
  // Handle blurred URLs (simple IDs)
  const blurredMatch = pathname.match(/\/post-blurred\/(\d+)/);
  if (blurredMatch) {
    return blurredMatch[1];
  }
  
  // Handle secure URLs (11-digit IDs)
  const secureMatch = pathname.match(/\/post\/(\d{11})/);
  if (secureMatch) {
    const secureId = secureMatch[1];
    const { getCollectionId, isValidSecureId } = require("./secureIdMapper");
    
    if (!isValidSecureId(secureId)) {
      return null;
    }
    
    return getCollectionId(secureId);
  }
  
  return null;
};