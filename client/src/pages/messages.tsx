import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { 
  Home, 
  User, 
  MessageSquare, 
  Search, 
  Settings, 
  Send, 
  PlusCircle,
  Loader2,
  X,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";

// Define types for messages and chats
interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: User;
  receiver: User;
}

interface Chat {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

// Header Component
const MessagesHeader: React.FC<{ 
  currentChat?: Chat; 
  onBack?: () => void;
  showUserInfo: boolean;
  setShowUserInfo: (show: boolean) => void;
}> = ({ currentChat, onBack, showUserInfo, setShowUserInfo }) => {
  const isMobile = useIsMobile();
  
  if (!currentChat) {
    return (
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>
    );
  }
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-between p-4">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={onBack}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center cursor-pointer" onClick={() => setShowUserInfo(!showUserInfo)}>
          <Avatar className="h-9 w-9 mr-3">
            <AvatarImage src={currentChat.profilePicUrl} alt={currentChat.displayName || currentChat.username} />
            <AvatarFallback>
              {currentChat.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{currentChat.displayName || currentChat.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentChat.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

// Sidebar Navigation Component
const SidebarNav: React.FC = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
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
          <div className="flex items-center p-2">
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

// Chat List Component
const ChatList: React.FC<{ 
  chats: Chat[]; 
  selectedChat?: Chat | null;
  onSelectChat: (chat: Chat) => void; 
  onNewChat: () => void;
}> = ({ chats, selectedChat, onSelectChat, onNewChat }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">Messages</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onNewChat}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 pb-2">
        <Input 
          placeholder="Search messages..." 
          className="bg-gray-100 dark:bg-gray-800 border-0"
        />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">No messages yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
                Start a conversation with someone from your network.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={onNewChat}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 transition-colors",
                      selectedChat?.id === chat.id 
                        ? "bg-blue-50 dark:bg-blue-900/20" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="flex items-start">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={chat.profilePicUrl} 
                            alt={chat.displayName || chat.username} 
                          />
                          <AvatarFallback>
                            {chat.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <p className="font-medium truncate">
                            {chat.displayName || chat.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                            {chat.lastMessageTime && new Date(chat.lastMessageTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-blue-600 text-white mt-1">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Message Component
const MessageItem: React.FC<{ 
  message: Message; 
  isMine: boolean; 
  showAvatar?: boolean;
}> = ({ message, isMine, showAvatar = true }) => {
  return (
    <div className={cn(
      "flex items-end space-x-2 mb-2",
      isMine ? "justify-end" : "justify-start"
    )}>
      {!isMine && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={message.sender.profilePicUrl} 
            alt={message.sender.displayName || message.sender.username} 
          />
          <AvatarFallback>
            {message.sender.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      {isMine && !message.isRead && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Sent
        </span>
      )}
      
      <div className={cn(
        "rounded-2xl p-3 max-w-[75%] break-words",
        isMine 
          ? "bg-blue-600 text-white rounded-tr-none" 
          : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs mt-1 text-right opacity-70">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      
      {isMine && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={message.sender.profilePicUrl} 
            alt={message.sender.displayName || message.sender.username} 
          />
          <AvatarFallback>
            {message.sender.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// Chat Component
const ChatComponent: React.FC<{ 
  currentChat: Chat; 
  userId: number;
}> = ({ currentChat, userId }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Fetch messages for the selected chat
  const { 
    data: messages = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/messages", currentChat?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!currentChat
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/messages/send`, {
        method: "POST",
        body: JSON.stringify({
          receiverId: currentChat.userId,
          content
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", currentChat.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/chats"] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };
  
  // Scroll to bottom when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message: Message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            An error occurred loading messages. Please try again.
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300">No messages yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">
              Send a message to start the conversation with {currentChat.displayName || currentChat.username}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
                    {date === new Date().toLocaleDateString() ? "Today" : date}
                  </span>
                </div>
                <div className="space-y-1">
                  {dateMessages.map((message, idx) => {
                    // Determine if we should show the avatar
                    // Don't show avatar if consecutive messages from same sender
                    const showAvatar = idx === 0 || 
                      dateMessages[idx - 1].senderId !== message.senderId;
                    
                    return (
                      <MessageItem 
                        key={message.id} 
                        message={message} 
                        isMine={message.senderId === userId}
                        showAvatar={showAvatar}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// User Info Panel Component
const UserInfoPanel: React.FC<{ 
  user: Chat; 
  onClose: () => void;
}> = ({ user, onClose }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full",
      isMobile ? "w-full" : "w-80"
    )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 className="font-medium">User Information</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={user.profilePicUrl} 
            alt={user.displayName || user.username} 
          />
          <AvatarFallback>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-medium mt-4">
          {user.displayName || user.username}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          @{user.username}
        </p>
        
        <div className="flex mt-4 space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
          <Link href={`/profile/${user.username}`}>
            <a>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </a>
          </Link>
        </div>
      </div>
      
      <Separator />
      
      <div className="p-4">
        <h4 className="text-sm font-medium mb-2">Shared Media</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        </div>
      </div>
      
      <Separator />
      
      <div className="p-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Privacy & Support</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ul className="space-y-2 text-sm">
              <li className="text-red-600 cursor-pointer hover:underline">
                Block User
              </li>
              <li className="text-red-600 cursor-pointer hover:underline">
                Report User
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// New Chat Dialog Component
const NewChatDialog: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onSelectUser: (userId: number, username: string) => void;
}> = ({ isOpen, onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch users for search
  const { 
    data: users = [], 
    isLoading,
  } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: searchQuery.length > 0
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for users to start a new conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchQuery.length > 0 && users.length === 0 ? (
              <p className="text-center text-gray-500 p-4">
                No users found. Try a different search.
              </p>
            ) : (
              <ul className="space-y-2">
                {users.map((user: any) => (
                  <li key={user.id}>
                    <button
                      className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => {
                        onSelectUser(user.id, user.username);
                        onClose();
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.profilePicUrl} 
                          alt={user.displayName || user.username} 
                        />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 text-left">
                        <p className="font-medium">{user.displayName || user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

// Main Messages Page
export const MessagesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  
  const { data: authStatus } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Fetch chats
  const { 
    data: chats = [],
    isLoading: isLoadingChats
  } = useQuery({
    queryKey: ["/api/messages/chats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: authStatus?.authenticated
  });
  
  const queryClient = useQueryClient();
  
  // Start a new chat with a user
  const handleSelectUser = (userId: number, username: string) => {
    // Find if there's an existing chat
    const existingChat = chats.find((chat: Chat) => chat.userId === userId);
    
    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      // Create a new chat object
      const newChat: Chat = {
        id: Date.now(), // Temporary ID
        userId,
        username,
        unreadCount: 0,
        isOnline: false
      };
      
      setSelectedChat(newChat);
      
      // Optionally fetch more user details
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedChat(prev => prev ? {
            ...prev,
            displayName: data.displayName,
            profilePicUrl: data.profilePicUrl
          } : null);
        });
    }
  };
  
  // Handle chat selection
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    
    if (isMobile) {
      setShowUserInfo(false);
    }
    
    // Mark messages as read if there are unread messages
    if (chat.unreadCount > 0) {
      apiRequest(`/api/messages/mark-read`, {
        method: "POST",
        body: JSON.stringify({
          chatId: chat.id
        })
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/chats"] });
      });
    }
  };
  
  // Simplified, somewhat mocked sample data for development
  const sampleChats: Chat[] = [
    {
      id: 1,
      userId: 2,
      username: "janesmith",
      displayName: "Jane Smith",
      profilePicUrl: "/avatars/jane.jpg",
      lastMessage: "Looking forward to catching up!",
      lastMessageTime: "2025-05-14T12:30:00.000Z",
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      userId: 3,
      username: "mikejohnson",
      displayName: "Mike Johnson",
      profilePicUrl: "/avatars/mike.jpg",
      lastMessage: "Can you send me that file we discussed yesterday?",
      lastMessageTime: "2025-05-14T09:45:00.000Z",
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      userId: 4,
      username: "sarahwilliams",
      displayName: "Sarah Williams",
      lastMessage: "How's your project coming along?",
      lastMessageTime: "2025-05-13T18:20:00.000Z",
      unreadCount: 0,
      isOnline: true
    }
  ];
  
  // Redirect to login if not authenticated
  if (authStatus && !authStatus.authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to view and send messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-center mb-6">
              Please sign in to access your conversations and connect with other users.
            </p>
            <Link href="/login">
              <a>
                <Button>Sign In</Button>
              </a>
            </Link>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/signup">
                <a className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign up
                </a>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // For mobile: if a chat is selected, show only the chat
  if (isMobile && selectedChat) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
        <MessagesHeader 
          currentChat={selectedChat} 
          onBack={() => setSelectedChat(null)}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
        />
        
        <div className="flex-1 overflow-hidden flex">
          {showUserInfo ? (
            <UserInfoPanel 
              user={selectedChat} 
              onClose={() => setShowUserInfo(false)} 
            />
          ) : (
            <ChatComponent 
              currentChat={selectedChat} 
              userId={authStatus?.id || 0} 
            />
          )}
        </div>
        
        <MobileBottomNav />
        
        <NewChatDialog
          isOpen={showNewChat}
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectUser}
        />
      </div>
    );
  }
  
  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-950", !isMobile && "ml-64")}>
      <SidebarNav />
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={cn(
          "border-r border-gray-200 dark:border-gray-800 h-full",
          isMobile ? "w-full" : "w-80"
        )}>
          <ChatList 
            chats={isLoadingChats ? [] : (chats.length ? chats : sampleChats)} 
            selectedChat={selectedChat}
            onSelectChat={handleChatSelect}
            onNewChat={() => setShowNewChat(true)}
          />
        </div>
        
        {/* Main Chat Area */}
        {isMobile || !selectedChat ? null : (
          <div className="flex-1 flex flex-col h-full">
            <MessagesHeader 
              currentChat={selectedChat}
              showUserInfo={showUserInfo}
              setShowUserInfo={setShowUserInfo}
            />
            <div className="flex-1 overflow-hidden flex">
              <div className={cn("flex-1", showUserInfo ? "hidden md:block" : "")}>
                <ChatComponent 
                  currentChat={selectedChat} 
                  userId={authStatus?.id || 0} 
                />
              </div>
              
              {showUserInfo && (
                <UserInfoPanel 
                  user={selectedChat} 
                  onClose={() => setShowUserInfo(false)} 
                />
              )}
            </div>
          </div>
        )}
        
        {/* Welcome Screen (when no chat is selected) */}
        {!isMobile && !selectedChat && (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Select a conversation or start a new one to begin messaging.
              </p>
              <Button onClick={() => setShowNewChat(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <MobileBottomNav />
      
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};