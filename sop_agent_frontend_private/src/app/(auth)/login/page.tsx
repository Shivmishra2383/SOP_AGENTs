"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/authSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Loader2,
  FileText
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        toast({
          title: "Welcome back",
          description: "Login successful",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: resultAction.payload as string || "Invalid credentials",
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
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      
      {/* Branding Logo above the card */}
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
          <FileText size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight uppercase">OPSMIND_AI</span>
      </div>

      {/* Card Container */}
      <div className="flex w-full max-w-md flex-col gap-8 rounded-[2rem] border border-border/40 bg-card p-8 shadow-2xl sm:p-10">
        
        {/* Heading */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Login to access your SOP documents and AI assistant
          </p>
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
        >
          
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-semibold ml-1">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              className="h-12 rounded-xl border-border/40 bg-background px-4 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-semibold ml-1">
              Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 rounded-xl border-border/40 bg-background px-4 pr-12 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
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

          {/* Button */}
          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : "Sign In"}
          </Button>

        </form>

        {/* Footer */}
        <div className="pt-4 text-center border-t border-border/40">
          <p className="text-sm font-medium text-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline transition-all"
            >
              Create an account
            </Link>
          </p>
        </div>

      </div>

      {/* Trust Footer */}
      <p className="mt-8 text-xs text-muted-foreground">
        Secure encryption • Enterprise data isolation
      </p>
    </div>
  );
}
