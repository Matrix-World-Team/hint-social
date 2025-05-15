import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Loader2,
  ArrowLeft,
  User,
  MessageSquare,
  Home,
  User2,
  Bell,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Logo } from "@/components/logo";
import { useIsMobile } from "@/hooks/use-mobile";

// Types
interface SearchUser {
  id: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
  bio?: string;
}

interface SearchPost {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
}

interface SearchResults {
  users?: SearchUser[];
  posts?: SearchPost[];
}

// Header Component
const SearchHeader: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 px-4 py-2">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full mr-4 md:hidden"
          onClick={() => setLocation("/feed")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        
        <div className="md:hidden">
          <Logo className="h-8 w-auto" />
        </div>
        
        <h1 className="text-xl font-bold hidden md:block">Search</h1>
      </div>
    </header>
  );
};

// Sidebar Navigation Component (same as in other pages)
const SidebarNav: React.FC = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  if (isMobile) {
    return null; // Mobile uses bottom nav
  }
  
  const navItems = [
    { 
      name: "Home", 
      path: "/feed", 
      icon: <Home className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Profile", 
      path: authStatus?.authenticated ? `/profile/${authStatus.username}` : "/login", 
      icon: <User2 className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Search", 
      path: "/search", 
      icon: <SearchIcon className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Notifications", 
      path: "/notifications", 
      icon: <Bell className="h-6 w-6 mr-4" /> 
    },
  ];
  
  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center pb-6">
        <Logo className="h-8 w-auto" />
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-4 py-3 text-lg rounded-full transition-colors",
                  location === item.path 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}>
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {authStatus?.authenticated && (
        <div className="pt-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 text-lg"
          >
            <LogOut className="h-6 w-6 mr-4" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// User Card Component
const UserCard: React.FC<{ user: SearchUser }> = ({ user }) => {
  return (
    <Link href={`/profile/${user.username}`}>
      <a className="block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={user.profilePicUrl || undefined} alt={user.username} />
            <AvatarFallback>
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="font-bold truncate">
                {user.displayName || user.username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{user.username}
              </span>
              {user.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="ml-2">
            Profile
          </Button>
        </div>
      </a>
    </Link>
  );
};

// Post Card Component (simplified)
const PostCard: React.FC<{ post: SearchPost }> = ({ post }) => {
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) 
    : '';
  
  return (
    <Link href={`/post/${post.id}`}>
      <a className="block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <div className="flex">
          <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
            <AvatarImage src={post.profilePicUrl || undefined} alt={post.username} />
            <AvatarFallback>
              {post.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-bold truncate mr-1">
                {post.displayName || post.username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{post.username} · {formattedDate}
              </span>
            </div>
            
            <p className="mt-1 text-gray-900 dark:text-gray-100 line-clamp-3">
              {post.content}
            </p>
            
            {post.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 h-32">
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

// No Results Component
const NoResults: React.FC<{ query: string }> = ({ query }) => {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <SearchIcon className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No results found</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        We couldn't find anything matching "{query}". 
        Try searching for something else.
      </p>
    </div>
  );
};

// Search Form Component
const SearchForm: React.FC<{
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
}> = ({ query, setQuery, onSearch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };
  
  return (
    <form onSubmit={handleSubmit} className="px-4 py-2">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
        <Input
          type="search"
          placeholder="Search for people or posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-6 w-full rounded-full border-gray-300 focus:border-blue-500 dark:bg-gray-800"
          autoFocus
        />
      </div>
    </form>
  );
};

// Main Search Page
export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts">("all");
  const isMobile = useIsMobile();
  
  const { 
    data: results,
    isLoading,
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["/api/search", { q: searchQuery, type: searchType }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!searchQuery,
  });
  
  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchType(value as "all" | "users" | "posts");
    if (searchQuery) {
      // Refetch with new type
      refetch();
    }
  };
  
  // Effect to search on query change (with debounce)
  useEffect(() => {
    if (query.trim()) {
      const timerId = setTimeout(() => {
        setSearchQuery(query.trim());
      }, 500);
      
      return () => clearTimeout(timerId);
    }
  }, [query]);
  
  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
      <SidebarNav />
      <SearchHeader />
      
      <div className="max-w-2xl mx-auto">
        <SearchForm
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
        />
        
        <div className="mt-2">
          <Tabs 
            defaultValue="all" 
            value={searchType}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="users">People</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            
            <div className="pt-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Searching...
                  </p>
                </div>
              ) : isError ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    An error occurred while searching. Please try again.
                  </p>
                  <Button onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              ) : searchQuery && results ? (
                <>
                  <TabsContent value="all" className="mt-0">
                    {(!results.users?.length && !results.posts?.length) ? (
                      <NoResults query={searchQuery} />
                    ) : (
                      <>
                        {results.users && results.users.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold px-4 mb-2">People</h3>
                            {results.users.slice(0, 3).map((user) => (
                              <UserCard key={user.id} user={user} />
                            ))}
                            {results.users.length > 3 && (
                              <div className="text-center py-2">
                                <Button 
                                  variant="ghost" 
                                  onClick={() => setSearchType("users")}
                                >
                                  View all people
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {results.posts && results.posts.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold px-4 mb-2">Posts</h3>
                            {results.posts.slice(0, 5).map((post) => (
                              <PostCard key={post.id} post={post} />
                            ))}
                            {results.posts.length > 5 && (
                              <div className="text-center py-2">
                                <Button 
                                  variant="ghost" 
                                  onClick={() => setSearchType("posts")}
                                >
                                  View all posts
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="users" className="mt-0">
                    {!results.users?.length ? (
                      <NoResults query={searchQuery} />
                    ) : (
                      <div>
                        <div className="flex items-center px-4 py-2">
                          <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {results.users.length} {results.users.length === 1 ? 'person' : 'people'} found
                          </span>
                        </div>
                        {results.users.map((user) => (
                          <UserCard key={user.id} user={user} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="posts" className="mt-0">
                    {!results.posts?.length ? (
                      <NoResults query={searchQuery} />
                    ) : (
                      <div>
                        <div className="flex items-center px-4 py-2">
                          <MessageSquare className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {results.posts.length} {results.posts.length === 1 ? 'post' : 'posts'} found
                          </span>
                        </div>
                        {results.posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              ) : !searchQuery ? (
                <div className="py-12 text-center">
                  <SearchIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700" />
                  <h3 className="text-xl font-semibold mt-4 mb-2">
                    Search HINT
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Search for people, posts, and more.
                  </p>
                </div>
              ) : null}
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
          <div className="flex justify-around items-center p-2">
            <Link href="/feed">
              <a className="flex flex-col items-center p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </a>
            </Link>
            <Link href="/search">
              <a className="flex flex-col items-center p-2 text-blue-600 dark:text-blue-400">
                <SearchIcon className="h-5 w-5" />
                <span className="text-xs mt-1">Search</span>
              </a>
            </Link>
            <Link href={`/profile/${(results as any)?.username || ""}`}>
              <a className="flex flex-col items-center p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <User2 className="h-5 w-5" />
                <span className="text-xs mt-1">Profile</span>
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};