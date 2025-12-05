// components/PostCard.tsx - UPDATED WITH PROGRESSIVE LOADING
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collection } from "@/collections/collectionsData";
import { getBlurredPostUrl } from "@/utils/linkHelpers";
import ProgressiveImage from "@/components/ProgressiveImage";

interface PostCardProps {
  collection: Collection;
}

const PostCard = ({ collection }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post-blurred/${collection.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const blurredUrl = getBlurredPostUrl(collection.id);
    const fullUrl = window.location.origin + blurredUrl;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: collection.title,
          text: collection.description,
          url: fullUrl,
        });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(fullUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert(`Share this link: ${fullUrl}`);
      }
    }
  };

  const formatLikeCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  const renderCollectionPreview = () => {
    const { cardLayout, images } = collection;
    const previewImages = images.slice(0, cardLayout.maxImages);
    
    return (
      <div 
        className="relative overflow-hidden cursor-pointer group h-64 md:h-80"
        onClick={handleClick}
        style={{ overflow: 'hidden' }}
      >
        <div className={cardLayout.gridClasses}>
          {previewImages.map((image, index) => {
            const spanClasses = cardLayout.imageSpans?.[index] || '';
            
            return (
              <div 
                key={index} 
                className={`relative overflow-hidden ${spanClasses}`}
                style={{ overflow: 'hidden' }}
              >
                <ProgressiveImage
                  src={image.full}
                  thumbnail={image.thumb}
                  alt={`${collection.title} - ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-100 transition-transform duration-500"
                />
                {index === previewImages.length - 1 && images.length > cardLayout.maxImages && (
                  <div className="absolute bottom-3 right-4 z-10">
                    <span className="text-white text-lg font-bold drop-shadow-lg">
                      +{images.length - cardLayout.maxImages}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-[6px] group-hover:bg-opacity-5 group-hover:backdrop-blur-[4px] transition-all duration-300"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-md px-4">
            <h3 className="text-2xl font-bold mb-3">{collection.title}</h3>
            <p className="text-sm opacity-90 mb-2">{collection.description}</p>
            <p className="text-xs opacity-75">Click to view collection</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <article className="post-card rounded-xl overflow-hidden animate-fade-in bg-post-bg border border-border">
      {renderCollectionPreview()}
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:bg-secondary px-3 ${isLiked ? 'text-like' : 'text-muted-foreground'}`}
            >
              <Flame className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {formatLikeCount(collection.likes + (isLiked ? 1 : 0))}
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground px-3 relative"
              disabled={shareSuccess}
            >
              {shareSuccess ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {shareSuccess ? 'Copied!' : 'Share'}
              {shareSuccess && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;