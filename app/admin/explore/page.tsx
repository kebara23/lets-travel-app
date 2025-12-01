"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExploreAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("explore_posts")
        .select("*")
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("explore_posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Experience removed" });
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Insider CMS</h1>
        <Link href="/admin/explore/new">
          <Button className="bg-slate-900 text-white"><Plus className="w-4 h-4 mr-2" /> New Experience</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {post.image_url && <img src={post.image_url} className="h-48 w-full object-cover" />}
            <CardContent className="p-4">
              <div className="flex justify-between">
                <h3 className="font-bold text-slate-900">{post.title}</h3>
                {post.visibility === 'user' ? <Lock className="w-4 h-4 text-amber-500"/> : <Globe className="w-4 h-4 text-slate-400"/>}
              </div>
              <p className="text-sm text-blue-600 font-medium">{post.subtitle}</p>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
