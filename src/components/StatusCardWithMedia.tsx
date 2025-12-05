// components/StatusCardWithMedia.tsx - UPDATED WITH PROGRESSIVE LOADING
import { useState } from "react";
import { Flame, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressiveImage from "@/components/ProgressiveImage";

interface StatusCardWithMediaProps {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  title: string;
  text: string;
  timestamp: string;
  likes: number;
  comments: number;
  media?: {
    type: "image" | "video";
    url: string;
    alt?: string;
    thumbnail?: string;
  };
}

const StatusCardWithMedia = ({ 
  id,
  user,
  title,
  text,
  timestamp,
  likes,
  media
}: StatusCardWithMediaProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [showVideoControls, setShowVideoControls] = useState(false);

  const formatLikeCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  const handleLike = () => {
    if (isLiked) {
      setCurrentLikes(prev => prev - 1);
    } else {
      setCurrentLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    navigator.share?.({
      title: title,
      text: text,
      url: window.location.origin + `/status/${id}`
    }).catch(() => {
      navigator.clipboard.writeText(window.location.origin + `/status/${id}`);
    });
  };

  const handleVideoClick = () => {
    setShowVideoControls(true);
  };

  // Generate thumbnail path from full image URL
  const getThumbnailUrl = (url: string) => {
    return url.replace('/collection', '/thumbs/collection');
  };

  return (
    <div className="post-card rounded-xl overflow-hidden bg-post-bg border border-border animate-fade-in">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-semibold text-foreground">{user.name}</h3>
                {user.verified && (
                  <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.25 12l-2.75-2.75.75-3.25-3.25.75L12 0 8.75 2.75 5.5 2l.75 3.25L0 12l2.75 2.75-.75 3.25 3.25-.75L12 24l3.25-2.75 3.25.75-.75-3.25L24 12zm-11.5 6.25L6.75 12l1.75-1.75 2.25 2.25 5.25-5.25L18.25 9l-6.5 9.25z"/>
                  </svg>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
        </div>

        {title && <h4 className="text-lg font-bold text-foreground mb-2">{title}</h4>}
                
        <p className="text-foreground mb-4">{text}</p>

        {media && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {media.type === "image" ? (
              <ProgressiveImage
                src={media.url}
                thumbnail={getThumbnailUrl(media.url)}
                alt={media.alt || title}
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : (
              <div 
                className="relative cursor-pointer group"
                onClick={handleVideoClick}
              >
                {showVideoControls ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-auto max-h-96 object-cover"
                    poster={media.thumbnail}
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={media.thumbnail || media.url}
                      alt={media.alt || title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-300">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border bg-post-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:bg-secondary px-3 ${isLiked ? 'text-like' : 'text-muted-foreground'}`}
            >
              <Flame className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {formatLikeCount(currentLikes)}
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground px-3"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCardWithMedia;