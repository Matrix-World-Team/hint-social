import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useRoute } from "wouter";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  Users,
  UserX,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Lock,
  LogOut,
  BarChart3,
  Eye,
  Filter,
  RefreshCw
} from "lucide-react";

// Define types
interface AdminUser {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  profilePicUrl?: string;
  country: string;
  phone: string;
  createdAt: string;
  isAdmin?: boolean;
  status: 'active' | 'suspended' | 'deleted';
}

interface DeletionRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';
}

// Admin Login Component
const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Hardcoded admin validation
      if (username === "HintAdmin" && password === "Jaspermatrix@1") {
        // Admin login success
        // In a real app, you'd make an API call to a backend admin login endpoint
        
        // For this demo, we'll simulate a successful admin login
        localStorage.setItem("adminLoggedIn", "true");
        
        // Invalidate auth query to refresh the status
        queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
        
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin panel.",
        });
        
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <Card className="w-[450px]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Admin Login</span>
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the HINT admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label className="sr-only" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Admin Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  className="py-5"
                />
              </div>
              <div className="grid gap-1">
                <label className="sr-only" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  placeholder="Admin Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  className="py-5"
                />
              </div>
              <Button disabled={loading} className="mt-2 py-5">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <span className="flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In as Admin
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-2 text-center text-sm text-gray-500">
            This admin portal is for authorized personnel only
          </div>
          <Link href="/" className="mt-4 text-sm text-blue-500 hover:underline">
            ← Return to main site
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

// Admin Header Component
const AdminHeader: React.FC = () => {
  const [, navigate] = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast({
      title: "Logged out",
      description: "You have been logged out from the admin panel.",
    });
    navigate("/admin");
  };
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Logo className="h-8 w-auto" />
          <span className="ml-3 font-bold text-lg">Admin Portal</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

// Admin Sidebar Navigation
const AdminSidebar: React.FC = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return null;
  }
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <BarChart3 className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "User Management", 
      path: "/admin/users", 
      icon: <Users className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "Deletion Requests", 
      path: "/admin/deletion-requests", 
      icon: <UserX className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "Return to Site", 
      path: "/feed", 
      icon: <Home className="h-5 w-5 mr-3" /> 
    },
  ];
  
  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center pb-6">
        <Shield className="h-6 w-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold">HINT Admin</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  location === item.path 
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100" 
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                )}>
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-md">
              <Shield className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Admin Mode</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">HintAdmin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const AdminDashboard: React.FC = () => {
  // Sample dashboard stats 
  const stats = [
    { label: "Total Users", value: 2478, icon: <Users className="h-5 w-5" /> },
    { label: "Active Today", value: 124, icon: <User className="h-5 w-5" /> },
    { label: "New Signups (Last 7 days)", value: 38, icon: <User className="h-5 w-5" /> },
    { label: "Pending Deletion Requests", value: 3, icon: <UserX className="h-5 w-5" /> },
  ];
  
  // Refreshing queries to get latest data
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/admin/dashboard"],
    });
    
    toast({
      title: "Dashboard Refreshed",
      description: "Data has been updated with the latest information.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Most recently registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mocked data for display purposes */}
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>John Doe</div>
                        <div className="text-xs text-gray-500">@johndoe</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 10, 2025</TableCell>
                  <TableCell>United States</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>AS</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>Alice Smith</div>
                        <div className="text-xs text-gray-500">@alicesmith</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 9, 2025</TableCell>
                  <TableCell>Canada</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>BJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>Bob Johnson</div>
                        <div className="text-xs text-gray-500">@bobjohnson</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 8, 2025</TableCell>
                  <TableCell>UK</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              View All Users
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deletion Requests</CardTitle>
            <CardDescription>
              Recent account deletion requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mocked data for display purposes */}
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>EM</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>Emily Martin</div>
                        <div className="text-xs text-gray-500">@emilymartin</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 11, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </TableCell>
                  <TableCell className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>TW</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>Tom Williams</div>
                        <div className="text-xs text-gray-500">@tomwilliams</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 9, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </TableCell>
                  <TableCell className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>Sam Cooper</div>
                        <div className="text-xs text-gray-500">@samcooper</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>May 7, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">Processed</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              View All Requests
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // This would normally be fetched from an API
  const users: AdminUser[] = [
    {
      id: 1,
      username: "johndoe",
      email: "john.doe@example.com",
      displayName: "John Doe",
      profilePicUrl: "/avatars/john.jpg",
      country: "United States",
      phone: "+1 (555) 123-4567",
      createdAt: "2025-04-15T10:30:00.000Z",
      status: "active"
    },
    {
      id: 2,
      username: "janesmith",
      email: "jane.smith@example.com",
      displayName: "Jane Smith",
      profilePicUrl: "/avatars/jane.jpg",
      country: "Canada",
      phone: "+1 (555) 234-5678",
      createdAt: "2025-04-18T14:20:00.000Z",
      status: "active"
    },
    {
      id: 3,
      username: "bobwilson",
      email: "bob.wilson@example.com",
      displayName: "Bob Wilson",
      country: "United Kingdom",
      phone: "+44 7911 123456",
      createdAt: "2025-04-20T09:45:00.000Z",
      status: "active"
    },
    {
      id: 4,
      username: "alicewalker",
      email: "alice.walker@example.com",
      displayName: "Alice Walker",
      profilePicUrl: "/avatars/alice.jpg",
      country: "Australia",
      phone: "+61 4 9876 5432",
      createdAt: "2025-04-22T16:10:00.000Z",
      status: "suspended"
    },
    {
      id: 5,
      username: "HintAdmin",
      email: "admin@hint.com",
      displayName: "HINT Administrator",
      country: "United States",
      phone: "+1 (555) 987-6543",
      createdAt: "2025-03-01T00:00:00.000Z",
      isAdmin: true,
      status: "active"
    },
    {
      id: 6,
      username: "sarahconnor",
      email: "sarah.connor@example.com",
      displayName: "Sarah Connor",
      country: "Mexico",
      phone: "+52 55 1234 5678",
      createdAt: "2025-04-25T11:30:00.000Z",
      status: "active"
    },
    {
      id: 7,
      username: "mikebrown",
      email: "mike.brown@example.com",
      displayName: "Mike Brown",
      country: "Germany",
      phone: "+49 30 12345678",
      createdAt: "2025-04-28T08:15:00.000Z",
      status: "active"
    },
    {
      id: 8,
      username: "emilyjones",
      email: "emily.jones@example.com",
      displayName: "Emily Jones",
      country: "France",
      phone: "+33 1 23 45 67 89",
      createdAt: "2025-05-01T13:45:00.000Z",
      status: "active"
    },
    {
      id: 9,
      username: "davidlee",
      email: "david.lee@example.com",
      displayName: "David Lee",
      country: "South Korea",
      phone: "+82 2 1234 5678",
      createdAt: "2025-05-03T17:20:00.000Z",
      status: "deleted"
    },
    {
      id: 10,
      username: "oliviawang",
      email: "olivia.wang@example.com",
      displayName: "Olivia Wang",
      country: "China",
      phone: "+86 10 1234 5678",
      createdAt: "2025-05-05T09:30:00.000Z",
      status: "active"
    }
  ];
  
  // Filter users based on search query and status
  const filteredUsers = users.filter(user => {
    const matchesQuery = 
      searchQuery === "" || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === "all" || 
      user.status === filterStatus;
    
    return matchesQuery && matchesFilter;
  });
  
  // User detail dialog
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Search by name, username or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "suspended" ? "default" : "outline"}
                onClick={() => setFilterStatus("suspended")}
                size="sm"
              >
                Suspended
              </Button>
              <Button
                variant={filterStatus === "deleted" ? "default" : "outline"}
                onClick={() => setFilterStatus("deleted")}
                size="sm"
              >
                Deleted
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.profilePicUrl} alt={user.displayName || user.username} />
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              {user.displayName || user.username}
                              {user.isAdmin && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            user.status === "active" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                            user.status === "suspended" && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
                            user.status === "deleted" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          )}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* User Detail Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={selectedUser.profilePicUrl} alt={selectedUser.displayName || selectedUser.username} />
                  <AvatarFallback>
                    {selectedUser.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.displayName || selectedUser.username}</h3>
                  <p className="text-gray-500">@{selectedUser.username}</p>
                  <div className="flex items-center mt-1">
                    <Badge
                      className={cn(
                        selectedUser.status === "active" && "bg-green-100 text-green-800",
                        selectedUser.status === "suspended" && "bg-amber-100 text-amber-800",
                        selectedUser.status === "deleted" && "bg-red-100 text-red-800"
                      )}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </Badge>
                    {selectedUser.isAdmin && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedUser.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedUser.phone}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p>{selectedUser.country}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Joined Date</p>
                  <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={selectedUser.isAdmin}
                >
                  Reset Password
                </Button>
                
                {selectedUser.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                    disabled={selectedUser.isAdmin}
                  >
                    Suspend Account
                  </Button>
                ) : selectedUser.status === "suspended" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    disabled={selectedUser.isAdmin}
                  >
                    Reactivate
                  </Button>
                ) : null}
                
                <Button
                  variant="outline"
                  size="sm" 
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  disabled={selectedUser.isAdmin || selectedUser.status === "deleted"}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Deletion Requests Component
const DeletionRequests: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock data for deletion requests
  const deletionRequests: DeletionRequest[] = [
    {
      id: 1,
      userId: 4,
      username: "alicewalker",
      email: "alice.walker@example.com",
      reason: "I've decided to take a break from social media for a while.",
      createdAt: "2025-05-10T14:30:00.000Z",
      status: "pending"
    },
    {
      id: 2,
      userId: 9,
      username: "davidlee",
      email: "david.lee@example.com",
      reason: "I'm not finding the platform useful for my needs anymore.",
      createdAt: "2025-05-08T09:45:00.000Z",
      status: "approved"
    },
    {
      id: 3,
      userId: 3,
      username: "bobwilson",
      email: "bob.wilson@example.com",
      reason: "Privacy concerns regarding my personal data.",
      createdAt: "2025-05-12T16:15:00.000Z",
      status: "pending"
    }
  ];
  
  const queryClient = useQueryClient();
  
  // Handle approving a deletion request
  const handleApprove = (requestId: number) => {
    // In a real app, you'd make an API call here
    toast({
      title: "Request Approved",
      description: "The account deletion request has been approved.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/admin/deletion-requests"] });
    
    setIsDialogOpen(false);
  };
  
  // Handle denying a deletion request
  const handleDeny = (requestId: number) => {
    // In a real app, you'd make an API call here
    toast({
      title: "Request Denied",
      description: "The account deletion request has been denied.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/admin/deletion-requests"] });
    
    setIsDialogOpen(false);
  };
  
  const handleViewRequest = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Deletion Requests</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Deletion Requests</CardTitle>
          <CardDescription>
            Manage requests from users who want to delete their accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletionRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">@{request.username}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          request.status === "pending" && "bg-amber-100 text-amber-800",
                          request.status === "approved" && "bg-green-100 text-green-800",
                          request.status === "denied" && "bg-red-100 text-red-800"
                        )}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() => handleDeny(request.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {deletionRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No deletion requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Request Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserX className="h-5 w-5 mr-2" />
              Deletion Request Details
            </DialogTitle>
            <DialogDescription>
              Review the account deletion request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold">@{selectedRequest.username}</h3>
                <p className="text-gray-500">{selectedRequest.email}</p>
                <Badge
                  className={cn(
                    "mt-2",
                    selectedRequest.status === "pending" && "bg-amber-100 text-amber-800",
                    selectedRequest.status === "approved" && "bg-green-100 text-green-800",
                    selectedRequest.status === "denied" && "bg-red-100 text-red-800"
                  )}
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Requested</p>
                  <p>{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason for Deletion</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md mt-1">
                    {selectedRequest.reason || "No reason provided"}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {selectedRequest.status === "pending" ? (
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDeny(selectedRequest.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Request
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Deletion
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                  {selectedRequest.status === "approved" 
                    ? "This deletion request was approved and processed." 
                    : "This deletion request was denied."}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mobile Bottom Navigation
const AdminMobileNav: React.FC = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
      <div className="flex justify-around items-center p-2">
        <Link href="/admin/dashboard">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/admin/dashboard" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/admin/users">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/admin/users" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Users</span>
          </a>
        </Link>
        
        <Link href="/admin/deletion-requests">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            location === "/admin/deletion-requests" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <UserX className="h-5 w-5" />
            <span className="text-xs mt-1">Deletions</span>
          </a>
        </Link>
        
        <Link href="/feed">
          <a className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors",
            "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Exit</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

// Main Admin Component
export const AdminPage: React.FC = () => {
  const [, params] = useRoute('/admin/:page');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile();
  
  // Check if admin is logged in
  React.useEffect(() => {
    const adminStatus = localStorage.getItem("adminLoggedIn");
    setIsLoggedIn(adminStatus === "true");
  }, []);
  
  // Determine which page to show
  const getCurrentPage = () => {
    if (!isLoggedIn) {
      return <AdminLogin />;
    }
    
    const page = params?.page;
    
    switch (page) {
      case "dashboard":
        return (
          <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950", !isMobile && "ml-64")}>
            <AdminSidebar />
            <AdminHeader />
            <main className={cn(
              "container mx-auto p-4 pb-24",
              isMobile ? "pt-4" : "pt-6 max-w-screen-xl"
            )}>
              <AdminDashboard />
            </main>
            <AdminMobileNav />
          </div>
        );
      case "users":
        return (
          <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950", !isMobile && "ml-64")}>
            <AdminSidebar />
            <AdminHeader />
            <main className={cn(
              "container mx-auto p-4 pb-24",
              isMobile ? "pt-4" : "pt-6 max-w-screen-xl"
            )}>
              <UserManagement />
            </main>
            <AdminMobileNav />
          </div>
        );
      case "deletion-requests":
        return (
          <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950", !isMobile && "ml-64")}>
            <AdminSidebar />
            <AdminHeader />
            <main className={cn(
              "container mx-auto p-4 pb-24",
              isMobile ? "pt-4" : "pt-6 max-w-screen-xl"
            )}>
              <DeletionRequests />
            </main>
            <AdminMobileNav />
          </div>
        );
      default:
        return <AdminLogin />;
    }
  };
  
  return getCurrentPage();
};