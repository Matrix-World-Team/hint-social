import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Settings,
  User,
  Bell,
  Shield,
  LogOut,
  AlertTriangle,
  Loader2,
  Lock,
  Home,
  MessageSquare,
  Search,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Profile update schema
const profileFormSchema = z.object({
  displayName: z.string().max(50, "Display name must be less than 50 characters").optional(),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Please enter a valid phone number"),
});

// Security settings schema
const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Notifications settings schema
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  mentionNotifications: z.boolean(),
  commentNotifications: z.boolean(),
  likeNotifications: z.boolean(),
  newFollowerNotifications: z.boolean(),
});

// Header Component
const SettingsHeader: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full mr-4"
            onClick={() => setLocation("/feed")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>
    </header>
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
      window.location.href = "/";
    },
  });
  
  if (isMobile) {
    return null; // On mobile, use bottom navigation instead
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
      icon: <User className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Messages", 
      path: "/messages", 
      icon: <MessageSquare className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Search", 
      path: "/search", 
      icon: <Search className="h-6 w-6 mr-4" /> 
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="h-6 w-6 mr-4" /> 
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
            className="w-full justify-start px-4 py-3 text-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
                {authStatus.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium text-sm">{authStatus.displayName || authStatus.username}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">@{authStatus.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Account Deletion Request Dialog
const AccountDeletionDialog: React.FC<{ username: string }> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/account/deletion-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        toast({
          title: "Request submitted",
          description: "Your account deletion request has been submitted for review.",
        });
        setIsOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Request Account Deletion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            Request Account Deletion
          </DialogTitle>
          <DialogDescription>
            This will submit a request to delete your account. The HINT admin team will review your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Username</p>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">{username}</div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Reason for deletion (optional)</p>
            <Textarea 
              placeholder="Please tell us why you want to delete your account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm text-amber-800 dark:text-amber-200 mb-4">
            <p className="font-medium">Important information:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>All your data will be permanently deleted</li>
              <li>This action cannot be undone once approved</li>
              <li>Processing may take up to 14 days</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Profile Settings Tab
const ProfileSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
  
  // Set form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        bio: user.bio || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return apiRequest("/api/profile/update", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update your profile information that will be shown to other users.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed to other users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write a short bio about yourself. Max 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Your email address will not be shown to other users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormDescription>
                  Your phone number will not be shown to other users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

// Security Settings Tab
const SecuritySettingsTab: React.FC = () => {
  const form = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof securityFormSchema>) => {
      return fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof securityFormSchema>) => {
    changePasswordMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account security and change your password.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Choose a strong password that you're not using elsewhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full md:w-auto mt-2"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Account Protection
          </CardTitle>
          <CardDescription>
            Additional security settings for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Login Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch checked={true} />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">Setup</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Notifications Settings Tab
const NotificationsSettingsTab: React.FC = () => {
  const form = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      mentionNotifications: true,
      commentNotifications: true,
      likeNotifications: true,
      newFollowerNotifications: true,
    },
  });
  
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationsFormSchema>) => {
      return fetch("/api/settings/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof notificationsFormSchema>) => {
    updateNotificationsMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose which notifications you want to receive.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <CardDescription>
                Configure which app notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="mentionNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Mentions</FormLabel>
                        <FormDescription>
                          When someone mentions you in a post or comment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commentNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Comments</FormLabel>
                        <FormDescription>
                          When someone comments on your post
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="likeNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Likes</FormLabel>
                        <FormDescription>
                          When someone likes your post
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newFollowerNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>New Followers</FormLabel>
                        <FormDescription>
                          When someone follows you
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={updateNotificationsMutation.isPending}
              >
                {updateNotificationsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notification Preferences"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

// Account Settings Tab
const AccountSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
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
      setLocation("/");
    },
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account and connected services.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-sm">@{user?.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-sm">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-sm">{user?.country || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm">{user?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          <CardDescription className="text-red-500">
            Actions here can't be undone. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Log out from all devices</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will terminate all active sessions except your current one.
            </p>
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
              Log Out All Devices
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Logout</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log out from your current session.
            </p>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Logout"
              )}
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Delete Account</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently delete your account and all associated data.
            </p>
            {user?.username && <AccountDeletionDialog username={user.username} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav: React.FC = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
      <div className="flex justify-around items-center p-2">
        <Link href="/feed">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/feed" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/search">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/search" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        
        <Link href="/messages">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/messages" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>
        
        <Link href={authStatus?.authenticated ? `/profile/${authStatus.username}` : "/login"}>
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location.startsWith("/profile") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/settings" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

// Main Settings Page
export const SettingsPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
      <SidebarNav />
      <SettingsHeader />
      
      <main className={cn(
        "container max-w-screen-lg mx-auto p-4 pb-24",
        isMobile ? "space-y-4" : "space-y-6 py-6"
      )}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2 hidden md:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2 hidden md:block" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2 hidden md:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center">
              <Settings className="h-4 w-4 mr-2 hidden md:block" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSettingsTab />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettingsTab />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsSettingsTab />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountSettingsTab />
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};