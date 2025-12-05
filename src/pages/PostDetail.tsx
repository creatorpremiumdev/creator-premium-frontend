// PostDetail.tsx - UPDATED WITH INLINE VIDEO
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { getCollection } from "@/collections/collectionsData";
import { getCollectionId, isValidSecureId } from "@/utils/secureIdMapper";
import ProgressiveImage from "@/components/ProgressiveImage";
import InlineVideoPlayer from "@/components/InlineVideoPlayer";

const PostDetail = () => {
  const { secureId } = useParams();
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [measuredDims, setMeasuredDims] = useState({});

  const imagesPerPage = 12;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite linear;
      }
      video::-webkit-media-controls-panel {
        display: none !important;
      }
      video::-webkit-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-fullscreen-button {
        display: none !important;
      }
      video::--webkit-media-controls-enclosure {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [secureId]);

  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const getCollectionFromSecureId = () => {
    if (!secureId || !isValidSecureId(secureId)) {
      return null;
    }
    const actualId = getCollectionId(secureId);
    return getCollection(actualId);
  };

  const collection = getCollectionFromSecureId();

  const getRandomDimensions = (index: number) => {
    const ratios = [
      { width: 400, height: 600 },
      { width: 800, height: 600 },
      { width: 600, height: 600 },
      { width: 1200, height: 400 },
      { width: 400, height: 800 },
    ];
    return ratios[index % ratios.length];
  };

  const preloadImages = (images: any[]) => {
    images.forEach((imageData, idx) => {
      const imageSrc = typeof imageData === 'string' ? imageData : imageData.full;
      
      if (isVideoUrl(imageSrc)) {
        // For videos, load metadata to get actual dimensions
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setLoadedImages(prev => new Set([...prev, imageSrc]));
          setMeasuredDims(prev => ({
            ...prev,
            [imageSrc]: { 
              width: video.videoWidth || 1920, 
              height: video.videoHeight || 1080 
            }
          }));
        };
        video.onerror = () => {
          setLoadedImages(prev => new Set([...prev, imageSrc]));
          // Fallback to 16:9 aspect ratio for videos
          setMeasuredDims(prev => ({
            ...prev,
            [imageSrc]: { width: 1920, height: 1080 }
          }));
        };
        video.src = imageSrc;
        return;
      }
      
      if (!loadedImages.has(imageSrc)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, imageSrc]));
          setMeasuredDims(prev => ({
            ...prev,
            [imageSrc]: { width: img.naturalWidth, height: img.naturalHeight }
          }));
        };
        img.onerror = () => {
          setLoadedImages(prev => new Set([...prev, imageSrc]));
          const dimensions = getRandomDimensions(idx);
          setMeasuredDims(prev => ({
            ...prev,
            [imageSrc]: { width: dimensions.width, height: dimensions.height }
          }));
        };
        img.src = imageSrc.split('?')[0];
      }
    });
  };

  const getCurrentImages = () => {
    if (!collection) return [];
    const endIndex = currentImagePage * imagesPerPage;
    return collection.images.slice(0, endIndex);
  };

  const getTotalImagePages = () => {
    if (!collection) return 0;
    return Math.ceil(collection.images.length / imagesPerPage);
  };

  useEffect(() => {
    if (collection) {
      const firstPageImages = collection.images.slice(0, imagesPerPage);
      preloadImages(firstPageImages);
    }
  }, [collection]);

  useEffect(() => {
    if (collection && currentImagePage < getTotalImagePages()) {
      const nextStartIndex = currentImagePage * imagesPerPage;
      const nextEndIndex = nextStartIndex + imagesPerPage;
      const nextImages = collection.images.slice(nextStartIndex, nextEndIndex);
      preloadImages(nextImages);
    }
  }, [currentImagePage, collection]);

  const loadMoreImages = () => {
    const totalPages = getTotalImagePages();
    if (currentImagePage < totalPages && !isLoadingImages) {
      setIsLoadingImages(true);
      setCurrentImagePage(prev => prev + 1);
      
      setTimeout(() => {
        window.scrollTo({
          top: window.scrollY + 100,
          behavior: 'smooth'
        });
      }, 100);
      
      setTimeout(() => {
        setIsLoadingImages(false);
      }, 300);
    }
  };

  if (!collection) {
    return (
      <div className="min-h-screen feed-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Collection not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  };

  const currentImages = getCurrentImages();
  const totalImagePages = getTotalImagePages();

  return (
    <div className="min-h-screen feed-bg">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            size="sm"
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="post-card rounded-xl p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-3">{collection.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{collection.description}</p>
            <div className="text-muted-foreground text-sm mt-4">
              {collection.timestamp}
            </div>
          </div>

          {currentImages.length > 0 && (
            <>
              <ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 3, 900: 4}}
              >
                <Masonry gutter="12px">
                  {currentImages.map((imageData, index) => {
                    const imageSrc = typeof imageData === 'string' ? imageData : imageData.full;
                    const thumbSrc = typeof imageData === 'string' 
                      ? imageSrc.replace('/collection', '/thumbs/collection')
                      : imageData.thumb;
                    
                    const mediaType = isVideoUrl(imageSrc) ? 'video' : 'image';
                    const isMediaLoaded = loadedImages.has(imageSrc);
                    const md = measuredDims[imageSrc];
                    const dimensions = getRandomDimensions(index);
                    const aspectW = md ? md.width : dimensions.width;
                    const aspectH = md ? md.height : dimensions.height;
                    
                    return (
                      <div 
                        key={`${imageSrc}-${index}`}
                        className="relative overflow-hidden rounded-lg animate-fade-in"
                        style={{ 
                          animationDelay: `${Math.min(index * 0.02, 1)}s`,
                          aspectRatio: `${aspectW} / ${aspectH}`
                        }}
                      >
                        {!isMediaLoaded && (
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 animate-pulse z-10">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                          </div>
                        )}
                        
                        {mediaType === 'video' ? (
                          <InlineVideoPlayer
                            src={imageSrc}
                            thumbnail={thumbSrc}
                            alt={`${collection.title} - Video ${index + 1}`}
                            className={`w-full h-full transition-all duration-500 ${
                              isMediaLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setLoadedImages(prev => new Set([...prev, imageSrc]))}
                          />
                        ) : (
                          <>
                            <ProgressiveImage
                              src={imageSrc}
                              thumbnail={thumbSrc}
                              alt={`${collection.title} - Image ${index + 1}`}
                              className={`w-full h-full object-cover transition-all duration-500 hover:scale-105 ${
                                isMediaLoaded ? 'opacity-100' : 'opacity-0'
                              }`}
                              onLoad={() => setLoadedImages(prev => new Set([...prev, imageSrc]))}
                            />
                            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${
                              isMediaLoaded ? 'opacity-100' : 'opacity-0'
                            }`} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>

              {currentImagePage < totalImagePages && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreImages}
                    disabled={isLoadingImages}
                    className="px-8 py-3 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:scale-105"
                  >
                    {isLoadingImages ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Next Page</span>
                        <span className="text-xs opacity-80">({currentImagePage}/{totalImagePages})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full backdrop-blur-sm">
                  <span className="text-sm text-muted-foreground">
                    Showing {Math.min(currentImagePage * imagesPerPage, collection.images.length)} of {collection.images.length} items
                  </span>
                </div>
              </div>
            </>
          )}

          <footer className="post-card rounded-xl p-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <Flame className="w-6 h-6 text-primary-foreground fill-current" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {collection.user.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">Exclusive Content</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Discover premium photography, art, and exclusive content from {collection.user.name}. 
                  Join the community of creative enthusiasts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 md:contents">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Explore</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button 
                        onClick={() => navigate('/')} 
                        className="text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        Gallery
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => navigate('/collections')} 
                        className="text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        Collections
                      </button>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                  <div className="flex gap-3 mb-4">
                    <span className="text-xs text-muted-foreground">External links replaced with demo placeholders.</span>
                  </div>
                  <p className="text-sm text-muted-foreground">hello@creator-premium.test</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-6">
              <button 
                className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-300 group mb-4 w-full bg-transparent border-none"
                onClick={() => navigate('/collections')}
              >
                <Flame className="w-4 h-4 fill-current text-primary group-hover:scale-110 transition-transform" />
                <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Unlock Everything
                </span>
              </button>
              <p className="text-center text-xs text-muted-foreground mb-6">
                Get unlimited access to exclusive content, HD downloads, and early access to new collections
              </p>
            </div>

            <div className="border-t border-border pt-6 text-center">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {collection.user.name}. All rights reserved. 
                <span className="mx-2">•</span>
                <button className="hover:text-primary transition-colors bg-transparent border-none text-xs text-muted-foreground underline-none">Privacy Policy</button>
                <span className="mx-2">•</span>
                <button className="hover:text-primary transition-colors bg-transparent border-none text-xs text-muted-foreground underline-none">Terms of Service</button>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;