import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { countryCodes } from "@/lib/countries";
import Logo from "@/components/logo";
import { 
  Input, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from "@/components/ui";

// Extended schema with additional validations
const signupSchema = insertUserSchema.extend({
  username: z.string()
    .min(4, "Username must be at least 4 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Please enter a valid email address"),
  birthMonth: z.string().min(1, "Please select a month"),
  birthDay: z.string().min(1, "Please select a day"),
  birthYear: z.string().min(1, "Please select a year"),
  countryCode: z.string().min(1, "Please select a country code"),
  phoneNumber: z.string().min(1, "Please enter your phone number"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Calculate age from birth date
  const birthDate = new Date(
    parseInt(data.birthYear),
    parseInt(data.birthMonth) - 1, // JavaScript months are 0-indexed
    parseInt(data.birthDay)
  );
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 13; // Ensure user is at least 13 years old
}, {
  message: "You must be at least 13 years old to sign up",
  path: ["birthYear"],
}).refine((data) => {
  // Validate that the birth date is valid
  const birthDate = new Date(
    parseInt(data.birthYear),
    parseInt(data.birthMonth) - 1,
    parseInt(data.birthDay)
  );
  
  return !isNaN(birthDate.getTime());
}, {
  message: "Please enter a valid birth date",
  path: ["birthDay"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      country: "",
      countryCode: "",
      phoneNumber: "",
      password: "",
      confirmPassword: ""
    }
  });

  const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [formDataCache, setFormDataCache] = useState<SignupFormValues | null>(null);

  // Calculate age from birth date
  const calculateAge = (year: string, month: string, day: string): number => {
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months are 0-indexed
      parseInt(day)
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const onSubmit = async (data: SignupFormValues) => {
    // Calculate the user's age
    const age = calculateAge(data.birthYear, data.birthMonth, data.birthDay);
    
    // Show age confirmation dialog
    if (!ageConfirmOpen) {
      setCalculatedAge(age);
      setFormDataCache(data);
      setAgeConfirmOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the confirmed data from cache
      const submitData = formDataCache || data;
      
      // Combine country code and phone number for storage
      const phone = `${submitData.countryCode} ${submitData.phoneNumber}`;
      
      // Remove fields not in the API schema and add calculated age
      const { 
        countryCode, 
        phoneNumber, 
        confirmPassword, 
        birthMonth, 
        birthDay, 
        birthYear, 
        ...restData 
      } = submitData;
      
      const response = await apiRequest('/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          ...restData,
          phone,
          age: calculatedAge // Use the calculated and confirmed age
        })
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your account has been created successfully.",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "Please try again later",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setAgeConfirmOpen(false);
      setFormDataCache(null);
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
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Join HINT and start connecting with stories that matter
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
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className={`mt-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="input-focus-effect">
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {/* Month Select */}
                    <div>
                      <Controller
                        name="birthMonth"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={errors.birthMonth ? 'border-red-500 focus:ring-red-500' : ''}
                            >
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <SelectItem key={month} value={month.toString()}>
                                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    
                    {/* Day Select */}
                    <div>
                      <Controller
                        name="birthDay"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={errors.birthDay ? 'border-red-500 focus:ring-red-500' : ''}
                            >
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    
                    {/* Year Select */}
                    <div>
                      <Controller
                        name="birthYear"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={errors.birthYear ? 'border-red-500 focus:ring-red-500' : ''}
                            >
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  {(errors.birthMonth || errors.birthDay || errors.birthYear) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.birthMonth?.message || errors.birthDay?.message || errors.birthYear?.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    You must be at least 13 years old to register
                  </p>
                </div>

                <div className="input-focus-effect">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.country?.message}
                      />
                    )}
                  />
                </div>

                <div className="input-focus-effect">
                  <Label className="text-sm font-medium text-gray-700">
                    Phone number
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <div className="w-1/3">
                      <Controller
                        name="countryCode"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={errors.countryCode ? 'border-red-500 focus:ring-red-500' : ''}
                            >
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodes.map(country => (
                                <SelectItem key={country.code} value={country.dialCode}>
                                  {country.dialCode} ({country.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="w-2/3">
                      <Input
                        placeholder="Phone number"
                        className={errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}
                        {...register("phoneNumber")}
                      />
                    </div>
                  </div>
                  {(errors.countryCode || errors.phoneNumber) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.countryCode?.message || errors.phoneNumber?.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Please enter in international format (e.g. +1 2345678900)
                  </p>
                </div>

                <div className="input-focus-effect">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
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

                <div className="input-focus-effect">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`mt-1 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <Checkbox id="terms" />
                  </div>
                  <div className="ml-3">
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </a>
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Age Confirmation Dialog */}
      <Dialog open={ageConfirmOpen} onOpenChange={setAgeConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Age</DialogTitle>
            <DialogDescription>
              Please verify that your age information is correct.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {calculatedAge}
              </span>
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                years old
              </span>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {formDataCache && (
                <p>
                  Born on {" "}
                  {new Date(
                    parseInt(formDataCache.birthYear),
                    parseInt(formDataCache.birthMonth) - 1,
                    parseInt(formDataCache.birthDay)
                  ).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgeConfirmOpen(false)}>
              Go Back
            </Button>
            <Button 
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
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
                  Creating account...
                </>
              ) : (
                "Confirm & Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupPage;
