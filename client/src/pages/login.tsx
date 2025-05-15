import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/login', data);

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've successfully logged in.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Incorrect username or password",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <style jsx="true">{`
        .bg-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .btn-gradient {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(79, 70, 229, 0.5);
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .input-focus-effect:focus-within {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>
      
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-96 -right-40 w-[800px] h-[800px] rounded-full bg-primary-200 opacity-30 blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-96 right-20 w-[700px] h-[700px] rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        <Card className="bg-glass shadow-xl animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your HINT account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="input-focus-effect">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="your_username"
                    className={`mt-1 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="input-focus-effect">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`mt-1 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <Checkbox id="remember" />
                  </div>
                  <div className="ml-3">
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-gradient text-white py-2 px-4 shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
