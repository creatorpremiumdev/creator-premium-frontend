import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

const Preloader = ({ isVisible, onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && !fadeOut) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center feed-bg transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Logo Section */}
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl animate-pulse">
            <Flame className="w-9 h-9 md:w-11 md:h-11 text-primary-foreground fill-current" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-accent rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;