"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Lightbulb, User, Calendar } from "lucide-react";

type InnovationIdea = {
  id: string;
  user_id: string;
  content: string;
  category: string | null;
  votes: number;
  created_at: string;
  users?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function InnovationHubPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<InnovationIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");

  // Fetch ideas
  async function fetchIdeas() {
    try {
      const { data, error } = await supabase
        .from("innovation_ideas")
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setIdeas(data || []);
    } catch (error: any) {
      console.error("Error fetching ideas:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ideas. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Submit new idea
  async function handleSubmit() {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your idea before submitting.",
      });
      return;
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("innovation_ideas")
        .insert({
          user_id: session.user.id,
          content: content.trim(),
          category: category,
        });

      if (error) throw error;

      // Reset form
      setContent("");
      setCategory("");

      toast({
        title: "Idea Posted",
        description: "Your idea has been submitted successfully.",
      });

      // Refresh ideas list
      await fetchIdeas();
    } catch (error: any) {
      console.error("Error submitting idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit idea. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  // Get category badge variant
  function getCategoryVariant(category: string | null): "default" | "secondary" | "destructive" | "outline" {
    switch (category) {
      case "Bug":
        return "destructive";
      case "Feature":
        return "default";
      case "Improvement":
        return "secondary";
      default:
        return "outline";
    }
  }

  // Get initials for avatar
  function getInitials(name: string | null): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // Initial fetch
  useEffect(() => {
    fetchIdeas();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("innovation-ideas-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "innovation_ideas" },
        () => {
          console.log("🔄 Innovation ideas updated, refetching...");
          fetchIdeas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-body">Innovation Hub</h1>
        <p className="text-slate-600 mt-1 font-body">Team ideas & feedback</p>
      </div>

      {/* Form Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-body">Share Your Idea</CardTitle>
          <CardDescription className="font-body">
            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-slate-700 font-body">
              What&apos;s your idea?
            </label>
            <Textarea
              id="content"
              placeholder="Describe your idea, bug report, or improvement suggestion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] font-body"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-700 font-body">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="font-body">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Improvement">UX Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || !category}
            className="font-body"
          >
            {isSubmitting ? "Posting..." : "Post Idea"}
          </Button>
        </CardContent>
      </Card>

      {/* Ideas List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-body">
          Recent Ideas ({ideas.length})
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-body">No ideas yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Card
                key={idea.id}
                className="bg-white border-slate-200 hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(idea.users?.full_name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate font-body">
                          {idea.users?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-body">
                          {formatDate(idea.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getCategoryVariant(idea.category)}
                      className="shrink-0 font-body"
                    >
                      {idea.category || "Uncategorized"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap font-body">
                    {idea.content}
                  </p>
                  {idea.votes > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 font-body">
                        <span className="font-medium">{idea.votes}</span> vote{idea.votes !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


