"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ExplorePost = {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ExplorePostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [post, setPost] = useState<ExplorePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const postId = params.id as string;

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from("explore_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;

      setPost(data);
    } catch (error: any) {
      console.error("Error fetching post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load post.",
      });
      router.push("/explore");
    } finally {
      setIsLoading(false);
    }
  }

  const categoryColors: Record<string, string> = {
    travel: "bg-blue-100 text-blue-700 border-blue-200",
    food: "bg-orange-100 text-orange-700 border-orange-200",
    culture: "bg-purple-100 text-purple-700 border-purple-200",
    adventure: "bg-green-100 text-green-700 border-green-200",
    luxury: "bg-yellow-100 text-yellow-700 border-yellow-200",
    tips: "bg-pink-100 text-pink-700 border-pink-200",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="outline"
            onClick={() => router.push("/explore")}
            className="font-body"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
          <Card className="bg-white border-slate-200">
            <CardContent className="py-16 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
                Post Not Found
              </h3>
              <p className="text-slate-600 font-body">
                The post you&apos;re looking for doesn&apos;t exist.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/explore")}
          className="font-body"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explore
        </Button>

        {/* Post Content */}
        <Card className="bg-white border-slate-200 overflow-hidden">
          {/* Image */}
          {post.image_url && (
            <div className="relative h-96 w-full overflow-hidden">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <CardContent className="p-8">
            {/* Header */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className={`font-body ${
                    categoryColors[post.category] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {post.category}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-body">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 font-body">
                {post.title}
              </h1>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none font-body">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {post.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

