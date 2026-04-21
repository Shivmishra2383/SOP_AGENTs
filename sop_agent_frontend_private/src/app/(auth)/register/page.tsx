"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/redux/authSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

/**
 * @fileOverview Registration page for new users.
 * Role selection is removed to prevent unauthorized administrative accounts.
 * All new accounts default to "user".
 */

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role,setRole]=useState("user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password||!role) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Role is hardcoded to "user" for public signups for security
      const resultAction = await dispatch(registerUser({ 
        name, 
        email, 
        password, 
        role,
      }));

      if (registerUser.fulfilled.match(resultAction)) {
        toast({
          title: "Account created",
          description: "Welcome to OPSMIND AI! Please log in.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: resultAction.payload as string || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
        
        {/* Branding Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-1 flex-col gap-8">
          <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight uppercase">
            <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
              <FileText size={24} />
            </div>
            OPSMIND_AI
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            Activate your team's <span className="text-primary italic">institutional</span> knowledge.
          </h1>

          <div className="flex flex-col gap-5 text-muted-foreground">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={20} />
              <span className="font-medium">Index unlimited SOP documents instantly.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={20} />
              <span className="font-medium">Enterprise-grade security and privacy.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={20} />
              <span className="font-medium">Advanced AI trained on your specific content.</span>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="w-full max-w-md">
          <Card className="overflow-hidden rounded-[2rem] border-border/50 bg-card shadow-2xl">
            <CardContent className="p-8 sm:p-10 flex flex-col gap-8">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Create Account
                </h2>
                <p className="text-muted-foreground">
                  Join the AI SOP Assistant platform today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="h-12 rounded-xl border-border/40 bg-background text-foreground" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@company.com" 
                    className="h-12 rounded-xl border-border/40 bg-background text-foreground" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a password" 
                      className="h-12 rounded-xl border-border/40 bg-background pr-12 text-foreground" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="h-12 w-full appearance-none rounded-xl border border-border/40 bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>


                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : "Get Started Free"}
                </Button>
              </form>

              <div className="pt-4 border-t border-border/40 text-center space-y-4">
                <p className="text-sm font-medium text-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-bold">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
