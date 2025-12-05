import { Moon, Sun, Search, Bell, User, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface FeedHeaderProps {
  onSearch: (query: string) => void;
  onLogoClick?: () => void;
  sidebarOpen?: boolean;
}

const FeedHeader = ({ onSearch, onLogoClick }: FeedHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const searchSuggestions = [
    "Golden Sun", "Nature's Bloom", "Crimson Mystery", "Sheer Elegance",
    "Cowgirl Dreams", "Ocean Waves", "Velvet Desire", "Inner Peace",
    "Scarlet Seduction", "Shadow Play", "Cozy Pink", "Body Appreciation",
    "Gallery Muse", "Pure White", "Midnight Black", "Cozy Life",
    "Daily Moments", "Exclusive Posts",
    "White", "Black", "Pink", "Red", "Green", "Beige", "Grey", "Leather", "Lace",
    "Lingerie", "Seduction", "Elegance", "Allure", "Comfort", "Desire",
    "Temptation", "Gallery", "Ocean", "Nature", "Flowers", "Sunset",
    "Cowgirl", "Art", "Sculpture", "Curves", "Shapes", "Cinematic",
    "Bold", "Playful", "Confident", "Intimate", "Sophisticated", "Daring",
    "Romantic", "Chic", "Minimal", "Cozy", "Sharp", "Soft", "Pure",
    "Dark", "Light", "Shadow", "Golden Hour", "Sun", "Tanning", "Modeling",
    "Sensuality", "Body Language", "Camera", "Photoshoot", "Behind Scenes"
  ];

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleLogoClick = () => {
    if (isDesktop && onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-post-bg/80 border-b border-border/50">
      <div className="max-w-none mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          <div 
            onClick={handleLogoClick}
            className={`flex items-center gap-3 lg:gap-4 flex-shrink-0 transition-opacity ${
              isDesktop ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
            }`}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Creator Premium
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Concept Gallery</p>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xl lg:max-w-2xl mx-4 lg:mx-12">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Find what you are looking for..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="relative pl-12 pr-4 py-3 bg-secondary/50 border-0 rounded-full focus:bg-secondary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-post-bg border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <Button
              onClick={() => window.location.href = '/collections'}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-300 px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span className="hidden lg:inline">Unlock Everything</span>
              <span className="lg:hidden">Unlock</span>
            </Button>

            <div className="w-px h-6 bg-border mx-1 lg:mx-2"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-secondary/80 rounded-full transition-all duration-200 hover:scale-105"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
        </div>

        <div className="md:hidden mt-4 space-y-3">
          <Button
            onClick={() => window.location.href = '/collections'}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-300 py-3 rounded-full font-semibold shadow-lg"
          >
            <Flame className="w-4 h-4 fill-current" />
            Unlock Everything
          </Button>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Find what you are looking for..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 bg-secondary/50 border-0 rounded-full focus:bg-secondary"
            />
            {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-post-bg border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FeedHeader;