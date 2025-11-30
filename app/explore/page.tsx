"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ExplorePost = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  category: string;
  content: string;
  target_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export default function ExplorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchPosts();
  }, []);

  async function getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  }

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("explore_posts")
        .select("id, title, subtitle, image_url, category, content, target_user_id, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load posts.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const categoryColors: Record<string, string> = {
    destination: "bg-blue-100 text-blue-700 border-blue-200",
    promotion: "bg-orange-100 text-orange-700 border-orange-200",
    upgrade: "bg-purple-100 text-purple-700 border-purple-200",
    tip: "bg-green-100 text-green-700 border-green-200",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 font-body">Insider Access</h1>
          <p className="text-slate-600 mt-2 font-body">
            Secret tips and exclusive offers reserved for our guests.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-16 text-center">
              <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
                No Posts Available
              </h3>
              <p className="text-slate-600 font-body">
                Check back soon for new content!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-white border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/explore/${post.id}`)}
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {post.target_user_id === userId && (
                      <Badge
                        variant="outline"
                        className="font-body text-xs backdrop-blur-sm bg-yellow-500/90 text-yellow-900 border-yellow-600 font-semibold"
                      >
                        Exclusive for You
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`font-body text-xs backdrop-blur-sm bg-white/80 ${
                        categoryColors[post.category] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="font-body text-xl line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  {post.subtitle && (
                    <p className="text-sm text-muted-foreground font-medium font-body mt-1">
                      {post.subtitle}
                    </p>
                  )}
                  <CardDescription className="font-body">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 font-body line-clamp-3 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full font-body group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/explore/${post.id}`);
                    }}
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

