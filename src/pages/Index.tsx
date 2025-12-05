import { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, Sun, Moon, Sparkles, Image, Camera, Flame, Flower2, Zap, Star, Droplet, CloudRain, Music, Palette, Briefcase, BookOpen, Gem, Crown, Target, Coffee, Feather } from "lucide-react";
import FeedHeader from "@/components/FeedHeader";
import PostCard from "@/components/PostCard";
import StatusCard from "@/components/StatusCard";
import StatusCardWithMedia from "../components/StatusCardWithMedia";
import Preloader from "@/components/Preloader";
import { collections, getAllCollectionIds, getCollection } from "@/collections/collectionsData";

const demoAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  const statusData = [
    {
      id: "status-24820024",
      user: {
        name: "Creator Premium",
        avatar: demoAvatar,
        verified: true
      },
      title: "Skyline Sketches",
      text: "Drafting night skyline beats and neon light references to storyboard the opener.",
      timestamp: "Today",
      likes: 124,
      comments: 9,
      media: {
        type: "image" as const,
        url: "https://picsum.photos/seed/story-preview/800/600",
        alt: "Storyboard preview"
      }
    },
    {
      id: "status-19475368",
      user: {
        name: "Creator Premium",
        avatar: demoAvatar,
        verified: true
      },
      title: "Lighting Test",
      text: "Captured a few lighting mocks with street market steam to show mood shifts.",
      timestamp: "Yesterday",
      likes: 98,
      comments: 4
    },
    {
      id: "status-73926481",
      user: {
        name: "Creator Premium",
        avatar: demoAvatar,
        verified: true
      },
      title: "UI Motion Notes",
      text: "Keyframes mapped against texture stills to guide interaction timing.",
      timestamp: "This week",
      likes: 132,
      comments: 7
    },
    {
      id: "status-58391627",
      user: {
        name: "Creator Premium",
        avatar: demoAvatar,
        verified: true
      },
      title: "Texture Study",
      text: "Soft fabric and metal swatches paired with diffused shadow passes.",
      timestamp: "2 hours ago",
      likes: 140,
      comments: 6,
      media: {
        type: "image" as const,
        url: "https://picsum.photos/seed/texture-study/800/600",
        alt: "Texture exploration"
      }
    },
    {
      id: "status-41739582",
      user: {
        name: "Creator Premium",
        avatar: demoAvatar,
        verified: true
      },
      title: "Campaign Seeds",
      text: "Short captions over abstract market frames to outline the story beats.",
      timestamp: "3 days ago",
      likes: 110,
      comments: 5
    },
  ];

  const collectionIds = getAllCollectionIds();
  
  const feedData = useMemo(() => {
    const mixedFeed = [];
    
    const workoutStatus = statusData.find(status => status.id === 'status-58391627');
    if (workoutStatus) {
      mixedFeed.push({
        ...workoutStatus,
        sortOrder: 0,
        feedType: 'status'
      });
    }

    collectionIds.forEach((collectionId, index) => {
      const collection = getCollection(collectionId);
      if (collection && !collectionId.startsWith('status-')) {
        mixedFeed.push({
          ...collection,
          sortOrder: (index * 1.5) + 1,
          feedType: 'collection'
        });
      }
    });

    statusData.forEach((status, index) => {
      if (status.id !== 'status-58391627') {
        mixedFeed.push({
          ...status,
          sortOrder: (index * 2.1) + 1.5,
          feedType: 'status'
        });
      }
    });

    return mixedFeed.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [collectionIds]);

  const filteredFeedData = useMemo(() => {
    if (!searchQuery) return feedData;
    
    return feedData.filter(post => {
      const query = searchQuery.toLowerCase();
      
      if (post.feedType === 'text-only') {
        return (
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.description && post.description.toLowerCase().includes(query))
        );
      } else if (post.feedType === 'collection') {
        return (
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.description && post.description.toLowerCase().includes(query))
        );
      } else if (post.feedType === 'status') {
        return (
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.text && post.text.toLowerCase().includes(query))
        );
      }
      return false;
    });
  }, [feedData, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const createStatusGroups = (posts) => {
    const groups = [];
    let i = 0;
    
    while (i < posts.length) {
      const post = posts[i];
      
      if (post.feedType === 'status') {
        const nextPost = posts[i + 1];
        const isLastStatus = i === posts.length - 1;
        
        if (isLastStatus && groups.length > 0) {
          const lastGroup = groups[groups.length - 1];
          if (lastGroup.type === 'single' && lastGroup.posts[0].feedType === 'status') {
            lastGroup.type = 'status-pair';
            lastGroup.posts.push(post);
            i += 1;
            continue;
          }
        }
        
        const canPair = nextPost && 
                       nextPost.feedType === 'status' && 
                       i + 1 < posts.length &&
                       Math.random() > 0.4;
        
        if (canPair && !isLastStatus) {
          groups.push({
            type: 'status-pair',
            posts: [post, nextPost],
            index: i
          });
          i += 2;
        } else {
          groups.push({
            type: 'single',
            posts: [post],
            index: i
          });
          i += 1;
        }
      } else {
        groups.push({
            type: 'single',
            posts: [post],
            index: i
        });
        i += 1;
      }
    }
    
    if (groups.length >= 2) {
      const lastGroup = groups[groups.length - 1];
      const secondLastGroup = groups[groups.length - 2];
      
      if (lastGroup.type === 'single' && 
          lastGroup.posts[0].feedType === 'status' &&
          secondLastGroup.type === 'single' && 
          secondLastGroup.posts[0].feedType === 'status') {
        secondLastGroup.type = 'status-pair';
        secondLastGroup.posts.push(lastGroup.posts[0]);
        groups.pop();
      }
    }
    
    return groups;
  };

  const renderPost = (post, index) => {
    if (post.feedType === 'text-only') {
      return (
        <article className="post-card rounded-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-lg font-bold text-foreground mb-3">{post.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
            <div className="text-muted-foreground text-xs mt-4 opacity-75">
              {post.timestamp}
            </div>
          </div>
          <div className="p-4 border-t border-border bg-post-bg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-like transition-colors px-3 py-1 hover:bg-secondary rounded-lg">
                  <Flame className="w-4 h-4 fill-current" />
                  {(post.likes / 1000).toFixed(0)}k
                </button>
              </div>
            </div>
          </div>
        </article>
      );
    } else if (post.feedType === 'collection') {
      return <PostCard collection={post} />;
    } else if (post.feedType === 'status') {
      return post.media ? (
        <StatusCardWithMedia
          id={post.id}
          user={post.user}
          title={post.title}
          text={post.text}
          timestamp={post.timestamp}
          likes={post.likes}
          comments={post.comments}
          media={post.media}
        />
      ) : (
        <StatusCard
          id={post.id}
          user={post.user}
          title={post.title}
          text={post.text}
          timestamp={post.timestamp}
          likes={post.likes}
          comments={post.comments}
        />
      );
    }
    return null;
  };

  const allCollections = useMemo(() => {
    return collectionIds
      .map(id => ({ id, collection: getCollection(id) }))
      .filter(item => item.collection && !item.id.startsWith('status-'))
      .map(item => item.collection);
  }, [collectionIds]);

  const handleCollectionClick = (collectionId: string) => {
    const element = document.getElementById(`collection-${collectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen feed-bg">
      {isLoading ? (
        <Preloader isVisible={true} onComplete={() => {}} />
      ) : (
        <>
          <FeedHeader onSearch={handleSearch} onLogoClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

          <div className="flex">
            <aside
              className={`hidden lg:block fixed left-0 bg-background border-r border-border z-20 transition-all duration-300 ${
                sidebarOpen ? 'translate-x-0 w-[380px]' : '-translate-x-full w-[380px]'
              }`}
              style={{ top: '65px', height: 'calc(100vh - 65px)' }}
            >
              <div className="h-full flex flex-col">
                <div className="pt-6 px-4 pb-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    Choose a collection from the list below
                  </p>
                 <button
  onClick={() => setSidebarOpen(false)}
  className="flex items-center gap-1.5 text-xs text-primary whitespace-nowrap flex-shrink-0 bg-background border border-border rounded-full px-3 py-2 cursor-pointer"
>
                    <ChevronLeft className="w-4 h-4" />
                    Close
                  </button>
                </div>

                <div className="flex-1 py-3 px-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="space-y-1">
                    {allCollections.map((collection, index) => {
                      const getIcon = (idx: number) => {
                        const IconComponent = [
                          Sun, Moon, Flame, Gem, Flower2, Star, Sparkles, Zap,
                          Camera, Droplet, CloudRain, Music, Palette, Briefcase,
                          BookOpen, Crown, Target
                        ][idx] || Coffee;
                        return <IconComponent className="w-4 h-4" />;
                      };
                      
                      return (
                        <button
                          key={collection.id}
                          onClick={() => handleCollectionClick(collection.id)}
                          className="w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-muted-foreground flex-shrink-0">
                              {getIcon(index)}
                            </span>
                            <span className="text-sm text-foreground truncate">
                              {collection.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-3 py-2 border-t border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{allCollections.length}</div>
                      <div className="text-[10px] text-muted-foreground">Collections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">450+</div>
                      <div className="text-[10px] text-muted-foreground">Photos</div>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 border-t border-border flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground text-center">
                    External links are disabled in this demo build.
                  </p>
                </div>
              </div>
            </aside>

            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex fixed left-4 top-1/2 transform -translate-y-1/2 z-30 bg-background border border-border rounded-full w-10 h-10 items-center justify-center"
                style={{ top: '50%' }}
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            )}

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[380px]' : 'lg:ml-0'}`} style={{ marginTop: '0px' }}>
              <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="space-y-6">
                  {searchQuery && (
                    <div className="post-card rounded-xl p-4 animate-fade-in">
                      <p className="text-muted-foreground">
                        Showing results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="ml-4 text-sm text-primary"
                        >
                          Clear search
                        </button>
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {createStatusGroups(filteredFeedData).map((group, groupIndex) => {
                      if (group.type === 'status-pair') {
                        return (
                          <div 
                            key={`group-${groupIndex}`}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in"
                            style={{ animationDelay: `${groupIndex * 0.1}s` }}
                          >
                            {group.posts.map((post, postIndex) => (
                              <div key={`${post.id}-${group.index + postIndex}`}>
                                {renderPost(post, group.index + postIndex)}
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        const post = group.posts[0];
                        return (
                          <div 
                            key={`${post.id}-${group.index}`}
                            id={post.feedType === 'collection' ? `collection-${post.id}` : undefined}
                            className="animate-fade-in"
                            style={{ animationDelay: `${groupIndex * 0.1}s` }}
                          >
                            {renderPost(post, group.index)}
                          </div>
                        );
                      }
                    })}
                  </div>

                  {searchQuery && filteredFeedData.length === 0 && (
                    <div className="post-card rounded-xl p-8 text-center animate-fade-in">
                      <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                      <p className="text-muted-foreground">
                        Try searching for something else or clear your search to see all posts.
                      </p>
                    </div>
                  )}
                </div>

                <footer className="post-card rounded-xl p-6 mt-12">
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
                          <p className="text-sm text-muted-foreground">{allCollections.length} Concept Collections</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        This is a placeholder experience showcasing the structure of the gallery with public demo imagery only.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:contents">
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Explore</h3>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <button 
                              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                              className="text-muted-foreground text-left bg-transparent border-none"
                            >
                              Gallery
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => window.location.href = '/collections'} 
                              className="text-muted-foreground text-left bg-transparent border-none"
                            >
                              Collections
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                        <div className="flex gap-3 mb-4">
                          <div className="text-muted-foreground text-xs">
                            Demo links use placeholder data.
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">contact@creator-premium.test</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border mt-8 pt-6">
                    <button 
                      className="flex items-center justify-center gap-2 cursor-pointer group mb-4 w-full bg-transparent border-none"
                      onClick={() => window.location.href = '/collections'}
                    >
                      <Flame className="w-4 h-4 fill-current text-primary" />
                      <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Unlock All Demo Collections
                      </span>
                    </button>
                    <p className="text-center text-xs text-muted-foreground mb-6">
                      Demo-only preview content with placeholder assets for concept review.
                    </p>
                  </div>

                  <div className="border-t border-border pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} Creator Premium. All rights reserved. 
                      <span className="mx-2">•</span>
                      <button className="bg-transparent border-none text-xs text-muted-foreground underline-none">Privacy Policy</button>
                      <span className="mx-2">•</span>
                      <button className="bg-transparent border-none text-xs text-muted-foreground underline-none">Terms of Service</button>
                    </p>
                  </div>
                </footer>
              </main>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;