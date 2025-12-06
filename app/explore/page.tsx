"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Star } from "lucide-react";

type ExplorePost = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string | null;
  category: string;
  content: string;
  visibility?: string | null;
  created_at: string;
  updated_at: string;
};

export default function InsiderPage() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      // Verificar autenticación (RLS filtra automáticamente lo que puedo ver)
      await supabase.auth.getUser();

      // Cargar Experiencias (RLS filtra automáticamente lo que puedo ver)
      const { data } = await supabase
        .from("explore_posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      setPosts(data || []);
      setLoading(false);
    };
    loadData();
  }, [supabase]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 max-w-md mx-auto lg:max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Insider Access</h1>
        <p className="text-slate-500">Curated experiences and exclusive upgrades selected for you.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
          <p className="text-slate-400">No experiences available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/explore/${post.id}`}>
              <Card className="overflow-hidden border-0 shadow-lg group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-56 w-full bg-slate-200">
                  {post.image_url ? (
                    <Image 
                      src={post.image_url} 
                      alt={post.title} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-800 flex items-center justify-center text-slate-600">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                
                {/* Badges Flotantes */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm hover:bg-white">
                    {post.category || "Experience"}
                  </Badge>
                </div>

                {/* Badge de Exclusividad */}
                {post.visibility === 'user' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-400 text-slate-900 border-amber-500 shadow-lg flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Exclusive for You
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-5 bg-white">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-xl text-slate-900 font-serif">{post.title}</h3>
                </div>
                
                {/* Subtítulo / Precio destacado */}
                {post.subtitle && (
                  <p className="text-emerald-700 font-semibold mb-3 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {post.subtitle}
                  </p>
                )}

                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Read More</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    →
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
