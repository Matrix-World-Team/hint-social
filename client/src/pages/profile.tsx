import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Edit,
  Check,
  X,
  ArrowLeft,
  Camera,
  Loader2,
  Home,
  Search,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/logo";

// Types for profile data
interface Profile {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicUrl?: string;
  email: string;
  country: string;
  age: number;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postCount: number;
}

// Types for posts
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

// Header Component with back button
const ProfileHeader: React.FC<{ title: string }> = ({ title }) => {
  const [, setLocation] = useLocation();
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full mr-4"
          onClick={() => setLocation("/feed")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </div>
    </header>
  );
};

// Post Card Component (simplified version from feed page)
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) 
    : '';
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <Link href={`/post/${post.id}`}>
        <a className="block">
          <div className="flex">
            <div className="flex-1 min-w-0">
              <div className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-line">
                {post.content}
              </div>
              
              {post.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="max-h-[300px] w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className="mt-3 flex items-start justify-between text-gray-500 dark:text-gray-400 text-sm">
                <span>{formattedDate}</span>
                <div className="flex space-x-4">
                  <span>{post.commentCount} comments</span>
                  <span>{post.likeCount} likes</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

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
  
  if (isMobile) {
    return null; // On mobile, use header with back button instead
  }
  
  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center pb-6">
        <Logo className="h-8 w-auto" />
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/feed">
              <a className={cn(
                "flex items-center px-4 py-3 text-lg rounded-full transition-colors",
                location === "/feed" 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Home className="h-6 w-6 mr-4" />
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/search">
              <a className={cn(
                "flex items-center px-4 py-3 text-lg rounded-full transition-colors",
                location === "/search" 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Search className="h-6 w-6 mr-4" />
                <span>Search</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      
      {authStatus?.authenticated && (
        <div className="pt-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 text-lg"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-6 w-6 mr-4" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// Profile Skeleton Loader
const ProfileSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-800 w-full"></div>
      
      <div className="px-4 relative">
        <div className="relative -top-16 mb-4">
          <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-950 bg-gray-300 dark:bg-gray-700 mx-auto" />
        </div>
        
        <div className="text-center -mt-6">
          <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 mx-auto mb-4"></div>
          
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded max-w-md mx-auto mb-4"></div>
          
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
          </div>
          
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32 mx-auto mb-8"></div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Profile Page
export const ProfilePage: React.FC = () => {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Get auth status
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Get profile data
  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile 
  } = useQuery({
    queryKey: ["/api/profile", username],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!username,
  });
  
  // Get user posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    isError: isPostsError 
  } = useQuery({
    queryKey: ["/api/feed", username],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!username,
  });
  
  // Initialize form values when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || profile.username);
      setBio(profile.bio || "");
    }
  }, [profile]);
  
  // Upload profile picture mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload-profile-pic", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      return response.json();
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; bio?: string; profilePicUrl?: string }) => {
      return apiRequest("/api/profile/update", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", username] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      
      setIsEditing(false);
      setProfileImage(null);
      setImagePreview(null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setProfileImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveProfile = async () => {
    try {
      let profilePicUrl;
      
      if (profileImage) {
        const result = await uploadImageMutation.mutateAsync(profileImage);
        profilePicUrl = result.imageUrl;
      }
      
      await updateProfileMutation.mutateAsync({
        displayName,
        bio,
        profilePicUrl,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setDisplayName(profile?.displayName || profile?.username || "");
    setBio(profile?.bio || "");
    setProfileImage(null);
    setImagePreview(null);
  };
  
  const isOwnProfile = authStatus?.authenticated && authStatus.username === username;
  const isPending = uploadImageMutation.isPending || updateProfileMutation.isPending;
  
  // Loading state
  if (isLoadingProfile) {
    return (
      <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
        <SidebarNav />
        <ProfileHeader title="Profile" />
        <ProfileSkeleton />
      </div>
    );
  }
  
  // Error state
  if (isProfileError || !profile) {
    return (
      <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
        <SidebarNav />
        <ProfileHeader title="Profile" />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/feed">
            <a>
              <Button>Return to Feed</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
      <SidebarNav />
      
      <ProfileHeader title={profile.displayName || profile.username} />
      
      <div>
        {/* Profile background */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        <div className="px-4 relative">
          {/* Profile picture */}
          <div className="relative -top-16 mb-4">
            <div className="relative mx-auto w-32 h-32">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-950">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt={profile.username} />
                ) : (
                  <>
                    <AvatarImage src={profile.profilePicUrl || undefined} alt={profile.username} />
                    <AvatarFallback className="text-3xl">
                      {profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              
              {isEditing && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-center -mt-10">
            {/* Display name */}
            {isEditing ? (
              <div className="mb-4">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="text-center text-xl font-bold max-w-xs mx-auto"
                  disabled={isPending}
                />
              </div>
            ) : (
              <h1 className="text-2xl font-bold mb-1">
                {profile.displayName || profile.username}
              </h1>
            )}
            
            {/* Username */}
            <p className="text-gray-600 dark:text-gray-400 mb-4">@{profile.username}</p>
            
            {/* Bio */}
            {isEditing ? (
              <div className="mb-4">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="max-w-md mx-auto h-24"
                  maxLength={160}
                  disabled={isPending}
                />
                <p className="text-gray-500 text-xs text-right max-w-md mx-auto mt-1">
                  {bio.length}/160
                </p>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-200 mb-4 max-w-md mx-auto whitespace-pre-line">
                {profile.bio || (isOwnProfile ? "Add a bio to tell the world about yourself." : "")}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <p className="font-bold text-lg">{profile.postCount}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.followersCount}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.followingCount}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Following</p>
              </div>
            </div>
            
            {/* Location and Age */}
            <div className="flex justify-center space-x-3 mb-4">
              <Badge variant="secondary">{profile.country}</Badge>
              <Badge variant="secondary">{profile.age} years old</Badge>
            </div>
            
            {/* Action buttons */}
            {isOwnProfile ? (
              isEditing ? (
                <div className="flex justify-center gap-2 mb-8">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mb-8"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )
            ) : (
              <div className="flex justify-center gap-2 mb-8">
                <Button>
                  Follow
                </Button>
                <Button variant="outline">
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Content tabs */}
        <Tabs defaultValue="posts" className="px-4">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            {isLoadingPosts ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : isPostsError || !posts ? (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load posts. Please try again.
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile 
                    ? "You haven't posted anything yet. Share your thoughts with the world!"
                    : `${profile.displayName || profile.username} hasn't posted anything yet.`}
                </p>
                {isOwnProfile && (
                  <Link href="/feed">
                    <a>
                      <Button className="mt-4">Create a Post</Button>
                    </a>
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            {isLoadingPosts ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : isPostsError || !posts ? (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load media. Please try again.
                </p>
              </div>
            ) : posts.filter(post => post.imageUrl).length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile 
                    ? "You haven't posted any media yet."
                    : `${profile.displayName || profile.username} hasn't posted any media yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {posts
                  .filter(post => post.imageUrl)
                  .map((post: Post) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <a className="aspect-square overflow-hidden rounded-md">
                        <img 
                          src={post.imageUrl} 
                          alt={post.content}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </a>
                    </Link>
                  ))
                }
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about" className="mt-0">
            <div className="space-y-6 max-w-md mx-auto py-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {profile.bio || "No bio provided."}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Location</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.country}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Age</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.age} years old</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Joined</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.createdAt 
                    ? format(new Date(profile.createdAt), 'MMMM yyyy') 
                    : 'Recently'}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};