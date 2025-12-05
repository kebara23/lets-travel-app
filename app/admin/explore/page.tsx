"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { Plus, Trash2, Globe, Lock, Copy, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ExploreAdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"experiences" | "templates">("experiences");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [duplicating, setDuplicating] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

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

      // Separate posts and templates
      const regularPosts = (data || []).filter((post: any) => !post.is_template);
      const templatePosts = (data || []).filter((post: any) => post.is_template === true);

      setPosts(regularPosts);
      setTemplates(templatePosts);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load experiences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("explore_posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Experience removed" });
      setPosts(posts.filter(p => p.id !== id));
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleDuplicateClick = (template: any) => {
    setSelectedTemplate(template);
    setSelectedClientId("");
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    if (!selectedTemplate || !selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    setDuplicating(true);

    try {
      // Create new post from template
      const { data, error } = await supabase
        .from("explore_posts")
        .insert({
          title: selectedTemplate.title,
          subtitle: selectedTemplate.subtitle,
          category: selectedTemplate.category,
          image_url: selectedTemplate.image_url,
          content: selectedTemplate.content,
          visibility: "user",
          target_user_id: selectedClientId,
          is_template: false, // New post is not a template
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Experience duplicated and assigned to client!",
      });

      setDuplicateDialogOpen(false);
      setSelectedTemplate(null);
      setSelectedClientId("");
      fetchPosts(); // Refresh list
    } catch (error: any) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate experience.",
        variant: "destructive",
      });
    } finally {
      setDuplicating(false);
    }
  };

  const renderPostCard = (post: any, isTemplate: boolean = false) => (
    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.image_url && (
        <div className="relative h-64 w-full">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg font-body">{post.title}</h3>
          {post.visibility === 'user' ? (
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </div>
        <p className="text-sm text-blue-600 font-medium mb-2 font-body">{post.subtitle}</p>
        {post.category && (
          <Badge variant="outline" className="mb-3 font-body">
            {post.category}
          </Badge>
        )}
        <div className="mt-4 flex gap-2 justify-end">
          {isTemplate && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleDuplicateClick(post)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-body"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate to Client
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/explore/${post.id}`)}
            className="text-blue-600 hover:text-blue-800 font-body hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(post.id)}
            className="text-red-500 hover:text-red-700 font-body"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="p-8 font-body">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 font-body">Insider CMS</h1>
        <Link href="/admin/explore/new">
          <Button className="bg-slate-900 text-white font-body">
            <Plus className="w-4 h-4 mr-2" /> New Experience
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "experiences" | "templates")} className="w-full">
        <TabsList className="font-body">
          <TabsTrigger value="experiences">
            Experiences ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experiences" className="mt-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 font-body">No experiences found. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => renderPostCard(post, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 font-body">
                No templates found. Create a template by checking "Save as Template" when creating an experience.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => renderPostCard(template, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="font-body">
          <DialogHeader>
            <DialogTitle>Duplicate to Client</DialogTitle>
            <DialogDescription>
              Select a client to assign this experience template to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTemplate && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900 font-body">{selectedTemplate.title}</p>
                <p className="text-sm text-slate-600 font-body">{selectedTemplate.subtitle}</p>
              </div>
            )}
            <ClientCombobox
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              placeholder="Search and select a client..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogOpen(false)}
              disabled={duplicating}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateConfirm}
              disabled={duplicating || !selectedClientId}
              className="bg-purple-600 hover:bg-purple-700 text-white font-body"
            >
              {duplicating ? "Duplicating..." : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
