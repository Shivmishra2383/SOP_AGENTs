"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LayoutDashboard, UploadCloud, LogOut, MessageSquare } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/chat", label: "Global Chat", icon: MessageSquare },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="p-6 flex items-center gap-3 border-b border-border mb-6">
            <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
              <FileText size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">OPSMIND_AI</span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
               <div className="pt-4 mt-4 border-t border-border/50">
                <p className="px-4 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Administrator
                </p>
                <Link
                  href="/dashboard/upload"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                    pathname === "/dashboard/upload"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <UploadCloud size={18} />
                  Upload SOP
                </Link>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-border mt-auto space-y-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center justify-start gap-3 px-4 py-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all font-medium"
            >
              <LogOut size={20} />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
          <header className="z-10 flex h-20 shrink-0 items-center justify-between border-b border-border bg-card px-8">
            <h2 className="text-xl font-bold text-foreground">SOP Assistant Console</h2>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-sm font-bold text-foreground">{user?.name || "User"}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role || "Member"}</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
