"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Download, ExternalLink, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Document = {
  id: string;
  trip_id: string;
  name: string;
  file_path: string;
  created_at: string;
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveTripAndDocuments();
  }, []);

  async function fetchActiveTripAndDocuments() {
    try {
      // 1. Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view documents.",
        });
        setLoading(false);
        return;
      }

      // 2. Find active trip for this user
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tripError) throw tripError;

      if (!tripData) {
        setActiveTripId(null);
        setDocuments([]);
        setLoading(false);
        return;
      }

      setActiveTripId(tripData.id);

      // 3. Fetch documents for this trip
      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("trip_id", tripData.id)
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;

      setDocuments(docsData || []);
    } catch (error: any) {
      console.error("Supabase Error:", error);
      toast({
        variant: "destructive",
        title: "Error loading documents",
        description: error.message || "Failed to load documents.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Get file icon based on extension
  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
    return FileText;
  }

  // Get public URL for document
  function getDocumentUrl(filePath: string) {
    const { data } = supabase.storage
      .from("trip-docs")
      .getPublicUrl(filePath);
    return data?.publicUrl || "";
  }

  // Handle document view/download
  function handleViewDocument(filePath: string, fileName: string) {
    const url = getDocumentUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate document URL.",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!activeTripId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Travel Documents</h1>
          <p className="text-slate-600 mt-2 font-body">
            View and download your trip documents
          </p>
        </div>
        <Card className="bg-white border-slate-200">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
              No Active Trips
            </h3>
            <p className="text-slate-600 font-body">
              You don&apos;t have any active trips. Documents will appear here once your trip is published.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-body">Travel Documents</h1>
        <p className="text-slate-600 mt-2 font-body">
          View and download your trip documents
        </p>
      </div>

      {documents.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
              No Documents Available Yet
            </h3>
            <p className="text-slate-600 font-body">
              Your travel documents will appear here once they are uploaded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.name);
            const docUrl = getDocumentUrl(doc.file_path);
            
            return (
              <Card 
                key={doc.id} 
                className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <FileIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="font-body text-lg line-clamp-2">
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="font-body mt-1">
                        {new Date(doc.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleViewDocument(doc.file_path, doc.name)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View / Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

