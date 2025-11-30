"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, Image as ImageIcon, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ExplorePost = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ExploreManagerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("explore_posts")
        .select("*")
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

  async function handleDeletePost(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("explore_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete post.",
      });
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Explore Content</h1>
          <p className="text-slate-600 mt-1 font-body">
            Manage posts for the Explore section
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/explore/new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-body"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Posts Table */}
      {posts.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
              No Posts Yet
            </h3>
            <p className="text-slate-600 font-body mb-4">
              Create your first post to get started.
            </p>
            <Button
              onClick={() => router.push("/admin/explore/new")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body">All Posts</CardTitle>
            <CardDescription className="font-body">
              {posts.length} {posts.length === 1 ? "post" : "posts"} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-20 font-body">Image</TableHead>
                    <TableHead className="font-body">Title</TableHead>
                    <TableHead className="font-body">Subtitle</TableHead>
                    <TableHead className="font-body">Category</TableHead>
                    <TableHead className="font-body">Created</TableHead>
                    <TableHead className="text-right font-body">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <Avatar className="h-12 w-12 border border-slate-200">
                          {post.image_url ? (
                            <AvatarImage src={post.image_url} alt={post.title} />
                          ) : (
                            <AvatarFallback className="bg-slate-100">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 font-body">
                          {post.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600 font-body">
                          {post.subtitle || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-body text-xs ${
                            categoryColors[post.category] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-body">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/explore/${post.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-body"
                            title="View Post"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/explore/${post.id}`)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 font-body"
                            title="Edit Post"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-body"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
