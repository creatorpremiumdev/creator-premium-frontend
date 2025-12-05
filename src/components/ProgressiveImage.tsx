// src/components/ProgressiveImage.tsx
import { useState, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  thumbnail: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const ProgressiveImage = ({ 
  src, 
  thumbnail, 
  alt, 
  className = "",
  onLoad 
}: ProgressiveImageProps) => {
  const [imgSrc, setImgSrc] = useState(thumbnail);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      if (onLoad) onLoad();
    };

    return () => {
      img.onload = null;
    };
  }, [src, onLoad]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default ProgressiveImage;