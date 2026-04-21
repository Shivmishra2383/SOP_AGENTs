import React from "react";
import { FileText, MessageSquare, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md md:px-16 lg:px-24">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase font-headline">
            OPSMIND_AI
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/login" className="text-muted-foreground hover:text-foreground font-medium transition-colors hidden sm:block">
            Login
          </Link>
          <Button asChild className="rounded-xl px-6 h-11 shadow-md">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-5xl text-center flex flex-col items-center gap-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold border border-primary/20 shadow-sm">
            <Zap size={14} className="fill-current" />
            New: AI-Powered Search Enhanced
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-bold text-foreground leading-tight tracking-tight font-headline">
            AI-Powered <span className="text-primary italic">SOP Assistant</span> for Modern Teams
          </h1>

          {/* Description */}
          <p className="text-muted-foreground max-w-3xl text-lg md:text-xl leading-relaxed">
            Transform your static SOP documents into interactive knowledge.
            Instantly find answers, automate compliance reviews, and boost
            organizational productivity.
          </p>

          {/* Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button asChild size="lg" className="rounded-xl h-14 px-10 text-lg shadow-xl shadow-primary/25">
              <Link href="/register" className="flex items-center gap-2">
                Start Free <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-y border-border/40 bg-card/40 px-6 py-24 md:px-16 lg:px-24">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center gap-16">
          <div className="flex flex-col items-center gap-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight font-headline">
              Powerful Features for Your Workflow
            </h2>
            <p className="text-muted-foreground text-lg">
              SOP Agent combines advanced vector search with generative AI to make your standard operating procedures work for you.
            </p>
          </div>

          <div className="w-full grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-10 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">SOP Upload</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamlessly upload PDF SOP documents. Our system automatically processes and indexes them for near-instant access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-10 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="bg-accent/10 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                <MessageSquare className="text-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">AI Interactive Chat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat with your documents in plain English. Get direct answers sourced directly from your verified procedures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-10 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Secure & Compliant</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data is isolated and secure. We ensure your sensitive organizational procedures are handled with enterprise-grade privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-card py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <FileText size={18} />
            </div>
            <span className="font-bold text-foreground tracking-tight">OPSMIND_AI</span>
          </div>

          <p className="text-muted-foreground text-sm">
            © 2026 OPSMIND_AI Inc. Built for intelligence.
          </p>

          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
