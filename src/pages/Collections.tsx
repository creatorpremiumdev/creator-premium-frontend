import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Loader2, Shield, Lock, Flame } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Preloader from "../components/Preloader";
import { collections, getAllCollectionIds, getCollection } from "@/collections/collectionsData";
import ProgressiveImage from "@/components/ProgressiveImage";
import InlineVideoPlayer from "@/components/InlineVideoPlayer";

const Collections = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [measuredDims, setMeasuredDims] = useState({});
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isCardPaymentLoading, setIsCardPaymentLoading] = useState(false);

  const imagesPerPage = 24;

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
      /* Mobile video styles */
      .video-container video {
        -webkit-transform: translateZ(0) scale(1.0001);
        transform: translateZ(0) scale(1.0001);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
        will-change: transform;
        background: black;
        display: block;
        object-fit: cover;
      }
      /* Force GPU acceleration on video containers */
      .video-container {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
        isolation: isolate;
        background: black;
        overflow: hidden;
      }
      /* Prevent video rendering issues when modal is open */
      body.modal-open-collections .video-container {
        -webkit-transform: translate3d(0, 0, 0) scale(0.999);
        transform: translate3d(0, 0, 0) scale(0.999);
      }
      body.modal-open-collections .video-container video {
        -webkit-transform: translateZ(0) scale(1.0001);
        transform: translateZ(0) scale(1.0001);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('modal-open-collections');
    return () => {
      document.body.classList.remove('modal-open-collections');
    };
  }, []);

  const isVideoUrl = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const collectionIds = getAllCollectionIds();
  const allImages = [];
  
  collectionIds.forEach(id => {
    const collection = getCollection(id);
    if (collection) {
      collection.images.forEach((imageData, index) => {
        const imageSrc = typeof imageData === 'string' ? imageData : imageData.full;
        const thumbSrc = typeof imageData === 'string' 
          ? imageSrc.replace('/collection', '/thumbs/collection')
          : imageData.thumb;
        
        const mediaType = isVideoUrl(imageSrc) ? 'video' : 'image';
        
        allImages.push({
          src: imageSrc,
          thumb: thumbSrc,
          collectionId: id,
          collectionTitle: collection.title,
          imageIndex: index,
          mediaType: mediaType,
          ...getRandomDimensions(allImages.length)
        });
      });
    }
  });

  function getRandomDimensions(index) {
    const ratios = [
      { width: 400, height: 600 },
      { width: 800, height: 600 },
      { width: 600, height: 600 },
      { width: 1200, height: 400 },
      { width: 400, height: 800 },
    ];
    return ratios[index % ratios.length];
  }

  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = allImages.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allImages.length / imagesPerPage);

  const preloadFirstPageImages = () => {
    const firstPageImages = currentImages;
    
    const preloadPromises = firstPageImages.map((imageObj) => {
      return new Promise((resolve) => {
        const srcUrl = imageObj.src;
        
        if (imageObj.mediaType === 'video') {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            setLoadedImages(prev => new Set([...prev, srcUrl]));
            setMeasuredDims(prev => ({
              ...prev,
              [srcUrl]: { 
                width: video.videoWidth || 1920, 
                height: video.videoHeight || 1080 
              }
            }));
            resolve(srcUrl);
          };
          video.onerror = () => {
            setLoadedImages(prev => new Set([...prev, srcUrl]));
            setMeasuredDims(prev => ({
              ...prev,
              [srcUrl]: { width: 1920, height: 1080 }
            }));
            resolve(srcUrl);
          };
          video.src = srcUrl;
          return;
        }

        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, srcUrl]));
          setMeasuredDims(prev => ({
            ...prev,
            [srcUrl]: { width: img.naturalWidth, height: img.naturalHeight }
          }));
          resolve(srcUrl);
        };
        img.onerror = () => {
          setMeasuredDims(prev => ({
            ...prev,
            [srcUrl]: { width: imageObj.width, height: imageObj.height }
          }));
          setLoadedImages(prev => new Set([...prev, srcUrl]));
          resolve(srcUrl);
        };
        const cleanUrl = srcUrl.split('?')[0];
        img.src = cleanUrl;
      });
    });

    Promise.allSettled(preloadPromises).then(() => {
      setTimeout(() => {
        setIsPreloading(false);
      }, 800);
    });
  };

  useEffect(() => {
    preloadFirstPageImages();
  }, []);

  const handleUnlockClick = () => {
    setShowUnlockModal(true);
  };

  // Email sanitization function
  const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email
      .toLowerCase()
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 254);
  };

  // Email validation function
  const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    if (email.length > 254 || email.length < 3) return false;
    
    if (email.includes('..')) return false;
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) return false;
    if (email.split('@').length !== 2) return false;
    if (!domain.includes('.')) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length === 0)) return false;
    
    return true;
  };

  const handleCardPaymentClick = () => {
    const sanitizedEmail = sanitizeEmail(customerEmail);

    if (!sanitizedEmail) {
      setPaymentError('Please enter your email address');
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setPaymentError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    setIsCardPaymentLoading(true);
    setPaymentError("");

    const checkoutUrl = `/checkout?` +
      `amount=224.99` +
      `&collectionId=all` +
      `&collectionTitle=${encodeURIComponent('All Exclusive Collections')}` +
      `&itemCount=${allImages.length}` +
      `&email=${encodeURIComponent(sanitizedEmail)}`;

    window.location.href = checkoutUrl;
  };

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <>
      <Preloader isVisible={isPreloading} onComplete={handlePreloaderComplete} />
      
      {!showPreloader && (
        <div className="min-h-screen feed-bg">
          <main className="max-w-7xl mx-auto px-4 py-6 relative">
          <button 
            onClick={() => window.history.back()}
            className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-full bg-secondary/80 backdrop-blur-xl hover:bg-secondary flex items-center justify-center text-foreground transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
            <ResponsiveMasonry
              columnsCountBreakPoints={{350: 1, 750: 3, 900: 4}}
            >
              <Masonry gutter="12px">
                {allImages.map((mediaObj, index) => {
                  const isMediaLoaded = loadedImages.has(mediaObj.src);
                  const md = measuredDims[mediaObj.src];
                  const aspectW = md ? md.width : mediaObj.width;
                  const aspectH = md ? md.height : mediaObj.height;

                  return (
                    <div 
                      key={`${mediaObj.src}-${index}`}
                      className={`relative overflow-hidden rounded-lg animate-fade-in cursor-pointer group ${mediaObj.mediaType === 'video' ? 'video-container' : ''}`}
                      style={{ 
                        animationDelay: `${Math.min(index * 0.01, 2)}s`,
                        aspectRatio: `${aspectW} / ${aspectH}`,
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)'
                      }}
                      onClick={handleUnlockClick}
                    >
                      {!isMediaLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 animate-pulse z-10">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                        </div>
                      )}
                      
                      {mediaObj.mediaType === 'video' ? (
                        <InlineVideoPlayer
                          src={mediaObj.src}
                          thumbnail={mediaObj.thumb}
                          alt={`${mediaObj.collectionTitle} - Video ${mediaObj.imageIndex + 1}`}
                          className={`w-full h-full transition-all duration-500 ${
                            isMediaLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => setLoadedImages(prev => new Set([...prev, mediaObj.src]))}
                          isBlurred={true}
                          onClick={handleUnlockClick}
                        />
                      ) : (
                        <>
                          <ProgressiveImage
                            src={mediaObj.src}
                            thumbnail={mediaObj.thumb}
                            alt={`${mediaObj.collectionTitle} - Image ${mediaObj.imageIndex + 1}`}
                            className={`w-full h-full object-cover transition-all duration-500 ${
                              isMediaLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setLoadedImages(prev => new Set([...prev, mediaObj.src]))}
                          />
                          <div className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${
                            isMediaLoaded ? 'opacity-100' : 'opacity-0'
                          }`} />
                        </>
                      )}
                    </div>
                  );
                })}
              </Masonry>
            </ResponsiveMasonry>

            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full backdrop-blur-sm">
                <span className="text-sm text-muted-foreground">
                  {allImages.length} exclusive items from {collectionIds.length} collections
                </span>
              </div>
            </div>

            {/* Payment Modal - Mobile Optimized */}
            {showUnlockModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  overscrollBehavior: 'contain'
                }}
              >
                <div 
                  className="bg-background/95 dark:bg-background/90 border border-border rounded-2xl p-3.5 sm:p-6 w-full max-w-[310px] sm:max-w-md shadow-2xl"
                  style={{
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-4">
                      <Flame className="w-5 h-5 sm:w-8 sm:h-8 text-primary-foreground fill-current" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1.5 sm:mb-2">
                      Unlock Everything
                    </h2>
                    <p className="text-xs sm:text-base text-muted-foreground mb-3.5 sm:mb-6">
                      Get instant access to all {collectionIds.length} exclusive collections with {allImages.length} premium items
                    </p>
                    
                    {paymentError && (
                      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs sm:text-sm text-red-500">{paymentError}</p>
                      </div>
                    )}
                    
                    <div className="mb-3 sm:mb-4">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          setPaymentError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Go') {
                            e.preventDefault();
                            handleCardPaymentClick();
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        maxLength={254}
                      />
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 mb-3.5 sm:mb-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 sm:mb-2">Pay by Card - Half Anonymous</p>
                        <button 
                          onClick={handleCardPaymentClick}
                          disabled={isCardPaymentLoading}
                          className="w-full bg-secondary/80 hover:bg-secondary text-foreground py-2 sm:py-3.5 rounded-xl text-xs sm:text-base font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCardPaymentLoading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-foreground" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                              Pay by Card - $224.99
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                    
                    <div className="flex items-center justify-center gap-2.5 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span>SSL Encrypted</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      One-time purchase • Instant access • No subscriptions
                    </p>
                  </div>
                </div>
              </div>
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
                        Creator Premium
                      </h2>
                      <p className="text-sm text-muted-foreground">17 Exclusive Collections</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Explore public-domain inspired photography, art, and motion tests curated for demo purposes only. 
                    Browse 17 mixed concept collections built from placeholder assets.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 md:contents">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Explore</h3>
                    <ul className="space-y-2 text-sm">
                      <li onClick={() => window.location.href = '/'}><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Gallery</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Collections</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                    <div className="flex gap-3 mb-4">
                      <span className="text-xs text-muted-foreground">External links replaced with placeholders.</span>
                    </div>
                    <p className="text-sm text-muted-foreground">hello@creator-premium.test</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border mt-8 pt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Creator Premium. All rights reserved. 
                  <span className="mx-2">•</span>
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <span className="mx-2">•</span>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </p>
              </div>
            </footer>
          </main>
        </div>
      )}
    </>
  );
};

export default Collections;