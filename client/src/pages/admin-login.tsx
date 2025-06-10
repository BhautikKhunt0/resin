import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin dashboard.",
      });
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Link href="/">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
                <p className="text-gray-600 text-center">
                  Sign in to access the admin dashboard
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="admin@modernshop.com"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Demo credentials: admin@modernshop.com / password
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Hero Section */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-blue-700 items-center justify-center text-white p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold mb-6">Manage Your Store</h2>
            <p className="text-xl mb-8 text-blue-100">
              Access powerful admin tools to manage products, categories, orders, and more.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Product Management</h3>
                <p className="text-sm text-blue-100">Add, edit, and organize your product catalog</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Tracking</h3>
                <p className="text-sm text-blue-100">Monitor and update order statuses</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Categories</h3>
                <p className="text-sm text-blue-100">Organize products into categories</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-blue-100">View sales and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
