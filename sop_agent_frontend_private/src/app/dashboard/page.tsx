"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getAllSOPs, deleteSOP, uploadSOP } from "@/redux/sopSlice";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  UploadCloud, 
  FileText, 
  Search, 
  MessageSquare, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const { items: sops, loading, uploadLoading } = useSelector((state: RootState) => state.sop);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAllSOPs());
  }, [dispatch]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await dispatch(uploadSOP({ 
        file, 
        title: file.name.replace(/\.[^/.]+$/, "") 
      })).unwrap();
      toast({
        title: "SOP Uploaded",
        description: "Document has been successfully indexed.",
      });
      dispatch(getAllSOPs());
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err || "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSOP(id)).unwrap();
      toast({
        title: "SOP Deleted",
        description: "The document has been removed.",
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err || "Could not delete the document.",
        variant: "destructive",
      });
    }
  };

  const filteredSOPs = sops.filter((sop) =>
    sop.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOP Collection</h1>
          <p className="text-muted-foreground">
            Manage and interact with your organizational procedures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground px-6 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 font-bold">
              {uploadLoading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
              {uploadLoading ? "Uploading..." : "Upload PDF"}
            </div>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploadLoading}
            />
          </label>
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/dashboard/upload">Open Upload Page</Link>
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-xl">
        {/* Search Header */}
        <div className="p-8 border-b border-border/40 bg-muted/20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search documents by title..."
              className="h-12 w-full rounded-xl border-border/50 bg-background pl-12 shadow-sm focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && sops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-medium">Retrieving procedures...</p>
          </div>
        )}

        {/* Table Container */}
        <div className="flex-1">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[40%] pl-8 font-bold text-foreground">Document Name</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="font-bold text-foreground">Coverage</TableHead>
                <TableHead className="font-bold text-foreground">Uploaded</TableHead>
                <TableHead className="text-right pr-8 font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSOPs.map((sop) => (
                <TableRow key={sop.id || sop._id} className="group border-border/40 hover:bg-primary/5 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        <FileText size={20} />
                      </div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sop.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <CheckCircle2 size={12} />
                      Ready
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {(sop.totalPages || 0) > 0 ? `${sop.totalPages} pages` : "Pages pending"} •{" "}
                    {(sop.chunkCount || 0) > 0 ? `${sop.chunkCount} chunks` : "Indexing pending"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {new Date(sop.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end items-center gap-2">
                      <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-primary hover:bg-primary/10">
                        <Link href={`/dashboard/chat?sopId=${sop._id || sop.id}`}>
                          <MessageSquare size={18} />
                          <span className="hidden sm:inline">Ask AI</span>
                        </Link>
                      </Button>
                      
                      {user && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sop.id || sop._id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {!loading && filteredSOPs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-6">
            <div className="bg-muted p-6 rounded-full">
              <FileText className="text-muted-foreground/40" size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No SOPs found</h3>
              <p className="text-muted-foreground max-w-xs">
                {search ? "Try adjusting your search terms to find the document." : "Your collection is currently empty. Start by uploading a procedure."}
              </p>
            </div>
            {!search && (
              <label className="cursor-pointer">
                <div className="bg-primary text-white h-11 px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20">
                  <UploadCloud size={20} />
                  Upload My First SOP
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AI Engine Online
        </div>
        <div className="text-xs text-muted-foreground">
          Enterprise Security Active • Data Encrypted
        </div>
      </div>
    </div>
  );
}
