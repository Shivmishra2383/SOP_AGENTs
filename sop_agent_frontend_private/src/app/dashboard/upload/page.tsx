"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { uploadSOP } from "@/redux/sopSlice";

export default function UploadSopPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { uploadLoading } = useSelector((state: RootState) => state.sop);
  const [isSuccess, setIsSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  
  const router = useRouter();
  const { toast } = useToast();


  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF document to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, we'd upload the file to storage first. 
      // For this demo, we store the metadata and a placeholder content.
      await dispatch(uploadSOP({
        title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
        file: file,
      }));

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "SOP document has been uploaded and indexed.",
      });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while processing the document.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Upload Standard Operating Procedure</h1>
        <p className="text-muted-foreground">Our AI will automatically index your document for quick querying.</p>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/50 bg-card shadow-xl">
        <CardContent className="p-10 space-y-8">
      

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-bold">Knowledge Base Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Refund Policy Handbook"
                className="h-12 rounded-xl border-border/50"
              />
            </div>

            <Label className="text-base font-bold">SOP Document (PDF)</Label>
            {!file ? (
              <div 
                className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                  <div className="rounded-2xl bg-background p-4 text-primary shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Click to select or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PDF files only (Max. 10MB). Pages are chunked and indexed for citations.</p>
                </div>
                <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-background p-3 text-primary shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setFile(null)}>
                  <X size={20} />
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
                onClick={handleUpload} 
                disabled={uploadLoading || isSuccess}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
            >
              {uploadLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin mr-2" />
                  Indexing Document...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={24} className="mr-2" />
                  Successfully Uploaded
                </>
              ) : (
                "Upload and Process SOP"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
