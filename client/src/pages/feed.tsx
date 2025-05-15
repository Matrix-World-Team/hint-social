import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Loader2,
  Image as ImageIcon,
  X,
  Search,
  Home,
  UserCircle2,
  Bell,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, formatDistanceToNow } from "date-fns";

// WebSocket setup for real-time updates
const setupWebSocket = (() => {
  let socket: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connected");
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update") {
          // Handle updates from the server
          console.log("Received update:", data);
          // The query client will handle refreshing the feed
          window.dispatchEvent(new CustomEvent("ws:update", { detail: data }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket disconnected, reconnecting...");
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 3000);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      socket?.close();
    };
  };
  
  return {
    connect,
    disconnect: () => {
      if (socket) {
        socket.close();
        socket = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    },
    send: (data: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    }
  };
})();

// Types for posts, comments, and profile
interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
}

// Sidebar Navigation Component
const SidebarNav: React.FC = () => {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });
  
  const navItems = [
    { 
      name: "Home", 
      path: "/feed", 
      icon: <Home className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Profile", 
      path: authStatus?.authenticated ? `/profile/${authStatus.username}` : "/login", 
      icon: <UserCircle2 className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Search", 
      path: "/search", 
      icon: <Search className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Notifications", 
      path: "/notifications", 
      icon: <Bell className="h-6 w-6 mr-4" /> 
    },
  ];
  
  if (isMobile) {
    // Mobile bottom navigation
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <a className={cn(
                "flex flex-col items-center p-2 rounded-full transition-colors",
                location === item.path 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}>
                {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop sidebar
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
      
      {authStatus?.authenticated ? (
        <div className="pt-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 text-lg"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-6 w-6 mr-4" />
            <span>Logout</span>
          </Button>
          
          <div className="flex items-center mt-4 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={authStatus.profilePicUrl || undefined} 
                alt={authStatus.username} 
              />
              <AvatarFallback>
                {authStatus.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium text-sm">{authStatus.displayName || authStatus.username}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">@{authStatus.username}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 mt-auto">
          <Link href="/login">
            <a className="block">
              <Button className="w-full">Login</Button>
            </a>
          </Link>
          <Link href="/signup">
            <a className="block mt-2">
              <Button variant="outline" className="w-full">Sign Up</Button>
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-between p-4 max-w-screen-md mx-auto">
        <div className="flex items-center">
          <Logo className="h-8 w-auto md:hidden mr-4" />
          <h1 className="text-xl font-bold">Home</h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full"
          onClick={() => setLocation("/search")}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </header>
  );
};

// New Post Component
const NewPostForm: React.FC = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload-post-image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      return response.json();
    },
  });
  
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl?: string }) => {
      return apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      setContent("");
      setImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      
      toast({
        title: "Post created",
        description: "Your post has been published!",
      });
      
      // Notify WebSocket for real-time updates
      setupWebSocket.send({ action: "new_post" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      let imageUrl;
      
      if (image) {
        const result = await uploadImageMutation.mutateAsync(image);
        imageUrl = result.imageUrl;
      }
      
      await createPostMutation.mutateAsync({
        content,
        imageUrl,
      });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const isLoading = uploadImageMutation.isPending || createPostMutation.isPending;
  const isPending = isLoading;
  const isDisabled = !content.trim() || isPending || !authStatus?.authenticated;
  
  if (!authStatus?.authenticated) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Sign in to share your thoughts with the world
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <a>
                <Button size="sm">Login</Button>
              </a>
            </Link>
            <Link href="/signup">
              <a>
                <Button variant="outline" size="sm">Sign Up</Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
            <AvatarImage 
              src={authStatus.profilePicUrl || undefined} 
              alt={authStatus.username} 
            />
            <AvatarFallback>
              {authStatus.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (!isExpanded && e.target.value) {
                  setIsExpanded(true);
                }
              }}
              onFocus={() => setIsExpanded(true)}
              className={cn(
                "resize-none border-none shadow-none focus-visible:ring-0 p-2 text-lg placeholder:text-gray-500 dark:placeholder:text-gray-400",
                isExpanded ? "min-h-[120px]" : "min-h-[60px]"
              )}
              disabled={isPending}
            />
            
            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={imagePreview}
                  alt="Post image preview"
                  className="max-h-[300px] w-auto mx-auto object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                  onClick={removeImage}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isExpanded && (
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="sr-only">Add image</span>
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  className="rounded-full px-4 py-2"
                  disabled={isDisabled}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Post Card Component
const PostCard: React.FC<{ post: Post; onCommentSuccess?: () => void }> = ({ 
  post,
  onCommentSuccess 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/comments", post.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: showComments,
  });
  
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/likes", {
        method: "POST",
        body: JSON.stringify({ postId: post.id }),
      });
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/feed"] });
      
      const previousPosts = queryClient.getQueryData<Post[]>(["/api/feed"]);
      
      queryClient.setQueryData<Post[]>(["/api/feed"], (old) => {
        if (!old) return [];
        
        return old.map((p) => {
          if (p.id === post.id) {
            return {
              ...p,
              isLiked: !p.isLiked,
              likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            };
          }
          return p;
        });
      });
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["/api/feed"], context.previousPosts);
      }
      
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });
  
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          postId: post.id,
          content,
        }),
      });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      if (onCommentSuccess) {
        onCommentSuccess();
      }
      
      // Notify WebSocket for real-time updates
      setupWebSocket.send({ action: "new_comment", postId: post.id });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
  };
  
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) 
    : '';
  
  const formattedUsername = post.displayName || post.username;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <div className="flex">
        <Link href={`/profile/${post.username}`}>
          <a className="flex-shrink-0">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={post.profilePicUrl || undefined} alt={post.username} />
              <AvatarFallback>
                {post.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </a>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Link href={`/profile/${post.username}`}>
              <a className="font-bold hover:underline truncate mr-1">
                {formattedUsername}
              </a>
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.username} · {formattedDate}</span>
          </div>
          
          <div className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-line">
            {post.content}
          </div>
          
          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="max-h-[400px] w-auto object-contain"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between max-w-md">
            <button 
              className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments) {
                  queryClient.invalidateQueries({ queryKey: ["/api/comments", post.id] });
                }
              }}
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              <span className="text-xs">{post.commentCount}</span>
            </button>
            
            <button className="flex items-center text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400">
              <Repeat2 className="h-5 w-5 mr-1" />
              <span className="text-xs">0</span>
            </button>
            
            <button 
              className={cn(
                "flex items-center",
                post.isLiked 
                  ? "text-pink-600 dark:text-pink-400" 
                  : "text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
              )}
              onClick={() => {
                if (!authStatus?.authenticated) {
                  toast({
                    title: "Sign in required",
                    description: "Please sign in to like posts.",
                  });
                  return;
                }
                toggleLikeMutation.mutate();
              }}
            >
              <Heart className={cn("h-5 w-5 mr-1", post.isLiked ? "fill-current" : "")} />
              <span className="text-xs">{post.likeCount}</span>
            </button>
            
            <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <Share className="h-5 w-5 mr-1" />
            </button>
          </div>
          
          {showComments && (
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {isLoadingComments ? (
                <div className="py-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex items-start">
                      <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                        <AvatarImage src={comment.profilePicUrl || undefined} alt={comment.username} />
                        <AvatarFallback>
                          {comment.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 min-w-0 flex-1">
                        <div className="flex items-center">
                          <Link href={`/profile/${comment.username}`}>
                            <a className="font-bold text-sm hover:underline truncate mr-1">
                              {comment.displayName || comment.username}
                            </a>
                          </Link>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-3 text-gray-500 dark:text-gray-400 text-sm">
                  No comments yet. Be the first to comment!
                </p>
              )}
              
              {authStatus?.authenticated ? (
                <form onSubmit={handleAddComment} className="mt-3">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                      <AvatarImage src={authStatus.profilePicUrl || undefined} alt={authStatus.username} />
                      <AvatarFallback>
                        {authStatus.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="resize-none min-h-[60px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                        >
                          {addCommentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Sign in to leave a comment
                  </p>
                  <Link href="/login">
                    <a>
                      <Button size="sm" variant="outline">Login</Button>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feed Skeleton Loader
const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
            <div className="flex-1">
              <div className="flex">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mr-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
              {Math.random() > 0.5 && (
                <div className="mt-3 h-40 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              )}
              <div className="mt-3 flex justify-between">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Feed Page
export const FeedPage: React.FC = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  
  // Query to get posts
  const { data: posts, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/feed", { limit, offset: (page - 1) * limit }],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Authentication status
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Set up WebSocket connection
  useEffect(() => {
    setupWebSocket.connect();
    
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    };
    
    window.addEventListener("ws:update", handleUpdate);
    
    // Polling for updates every 15 seconds as fallback if WebSocket fails
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    }, 15000);
    
    return () => {
      setupWebSocket.disconnect();
      window.removeEventListener("ws:update", handleUpdate);
      clearInterval(pollInterval);
    };
  }, [queryClient]);
  
  // Check if there are more posts to load
  useEffect(() => {
    if (posts && posts.length < limit) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [posts, limit]);
  
  const loadMorePosts = () => {
    setPage((prevPage) => prevPage + 1);
  };
  
  return (
    <div className={cn(
      "min-h-screen bg-white dark:bg-gray-950",
      isMobile ? "pb-14" : "ml-64" // Add left margin on desktop for the sidebar
    )}>
      <SidebarNav />
      
      <main className={cn(
        "max-w-screen-md mx-auto",
        isMobile ? "w-full" : ""
      )}>
        <Header />
        
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          <NewPostForm />
          
          {isLoading && page === 1 ? (
            <FeedSkeleton />
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Failed to load posts
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : posts && posts.length > 0 ? (
            <>
              {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasMore && (
                <div className="py-5 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    className="w-1/2"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {authStatus?.authenticated
                  ? "Be the first to share something with the world!"
                  : "Sign in to share your thoughts with the world."}
              </p>
              
              {!authStatus?.authenticated && (
                <div className="flex justify-center gap-3">
                  <Link href="/login">
                    <a>
                      <Button>Login</Button>
                    </a>
                  </Link>
                  <Link href="/signup">
                    <a>
                      <Button variant="outline">Sign Up</Button>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};