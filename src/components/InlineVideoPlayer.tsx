import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface InlineVideoPlayerProps {
  src: string;
  thumbnail: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  isBlurred?: boolean;
  onClick?: () => void;
}

const InlineVideoPlayer = ({ 
  src, 
  thumbnail, 
  alt, 
  className = "",
  onLoad,
  isBlurred = false,
  onClick
}: InlineVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const instanceIdRef = useRef(Math.random().toString(36));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      if (onLoad) onLoad();
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsVideoLoaded(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onLoad]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBlurred && onClick) {
      onClick();
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setShowThumbnail(false);
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullscreen) {
      exitFullscreen();
    } else if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Handle multiple video instances - pause others when this one plays
  useEffect(() => {
    const handlePlay = () => {
      const event = new CustomEvent('videoplay', { detail: { id: instanceIdRef.current } });
      window.dispatchEvent(event);
    };

    const handleOtherVideoPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.id !== instanceIdRef.current && videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', handlePlay);
    }
    
    window.addEventListener('videoplay', handleOtherVideoPlay);

    return () => {
      if (video) {
        video.removeEventListener('play', handlePlay);
      }
      window.removeEventListener('videoplay', handleOtherVideoPlay);
    };
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pos = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className} group overflow-hidden bg-black cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Image - Progressive Loading */}
      <img
        src={thumbnail}
        alt=""
        className={`w-full h-full object-cover absolute inset-0 ${isBlurred ? 'filter blur-sm' : ''} ${
          showThumbnail && !isPlaying ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-500`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Loading Indicator */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-5">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full ${isBlurred ? 'filter blur-sm' : ''} ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-500 ${isFullscreen ? 'object-contain' : 'object-cover'}`}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Fullscreen Back Button */}
      {isFullscreen && (
        <button
          onClick={exitFullscreen}
          className="absolute top-3 left-2 md:top-5 md:left-4 z-50 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 transition-all duration-300 shadow-lg text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && isVideoLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-all duration-300 cursor-pointer z-[5]"
          onClick={handlePlayPause}
        >
          <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Video Controls - Inline */}
      {isPlaying && !isBlurred && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 transition-all duration-300 z-[5] ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/20 rounded-full mb-2.5 cursor-pointer group/bar"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="hover:scale-110 transition-transform p-1"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="white" />
                ) : (
                  <Play className="w-5 h-5" fill="white" />
                )}
              </button>

              <button
                onClick={handleMuteToggle}
                className="hover:scale-110 transition-transform p-1"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-xs font-medium ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={handleFullscreen}
              className="hover:scale-110 transition-transform p-1"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Click overlay for blurred content */}
      {isBlurred && onClick && (
        <div 
          className="absolute inset-0 bg-black/40 cursor-pointer z-5"
          onClick={onClick}
        />
      )}
    </div>
  );
};

export default InlineVideoPlayer;