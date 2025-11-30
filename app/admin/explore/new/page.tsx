"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function NewExplorePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "destination",
    content: "",
    image_url: "",
    visibility: "global" as "global" | "specific",
    target_user_id: "",
  });

  const categories = [
    { value: "destination", label: "Destination" },
    { value: "promotion", label: "Promotion" },
    { value: "upgrade", label: "Upgrade" },
    { value: "tip", label: "Tip" },
  ];

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "client")
        .order("full_name", { ascending: true });

      if (error) throw error;

      setClients(data || []);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load clients.",
      });
    } finally {
      setIsLoadingClients(false);
    }
  }

  // Handle image file upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid image file (JPG, PNG, GIF, WEBP).",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    setUploading(true);
    const fileName = `explore_${Date.now()}_${file.name}`;
    const filePath = `explore/${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("trip-docs")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("trip-docs")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // 3. Update form data and preview
      setFormData({ ...formData, image_url: urlData.publicUrl });
      setImagePreview(urlData.publicUrl);

      toast({
        title: "Image uploaded!",
        description: "The image has been successfully uploaded.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message || "Failed to upload image.",
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  }

  // Remove image
  function handleRemoveImage() {
    setFormData({ ...formData, image_url: "" });
    setImagePreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error("Title and content are required.");
      }

      // Prepare insert payload
      const insertData: any = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        image_url: formData.image_url.trim() || null,
        category: formData.category,
        content: formData.content.trim(),
        target_user_id: formData.visibility === "specific" && formData.target_user_id 
          ? formData.target_user_id 
          : null,
      };

      const { data, error } = await supabase
        .from("explore_posts")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "The post has been successfully created.",
      });

      router.push("/admin/explore");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create post.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">New Post</h1>
          <p className="text-slate-600 mt-1 font-body">
            Create a new post for the Explore section
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/explore")}
          className="font-body"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
      </div>

      {/* Form */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="font-body">Post Details</CardTitle>
          <CardDescription className="font-body">
            Fill in the information for your new post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-body">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Cena Romántica en la Playa"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                className="font-body"
                required
              />
            </div>

            {/* Subtitle/Price */}
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="font-body">
                Subtitle / Price
              </Label>
              <Input
                id="subtitle"
                type="text"
                placeholder="Upgrade por $150"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                disabled={isSubmitting}
                className="font-body"
              />
              <p className="text-xs text-slate-500 font-body">
                Optional subtitle or price information
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-body">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility" className="font-body">
                Visibility <span className="text-red-500">*</span>
              </Label>
              <select
                id="visibility"
                value={formData.visibility}
                onChange={(e) => {
                  const newVisibility = e.target.value as "global" | "specific";
                  setFormData({
                    ...formData,
                    visibility: newVisibility,
                    target_user_id: newVisibility === "global" ? "" : formData.target_user_id,
                  });
                }}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                required
              >
                <option value="global">Global (All Users)</option>
                <option value="specific">Specific User</option>
              </select>
              <p className="text-xs text-slate-500 font-body">
                Choose who can see this post
              </p>
            </div>

            {/* Target User Selector (only if visibility is "specific") */}
            {formData.visibility === "specific" && (
              <div className="space-y-2">
                <Label htmlFor="target_user_id" className="font-body">
                  Select Client <span className="text-red-500">*</span>
                </Label>
                {isLoadingClients ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-body">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading clients...</span>
                  </div>
                ) : (
                  <select
                    id="target_user_id"
                    value={formData.target_user_id}
                    onChange={(e) => setFormData({ ...formData, target_user_id: e.target.value })}
                    disabled={isSubmitting || isLoadingClients}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                    required={formData.visibility === "specific"}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="font-body">
                Image
              </Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-64 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading || isSubmitting}
                      className="font-body"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-body">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-500 font-body">
                  Upload an image for this post (JPG, PNG, GIF, WEBP - Max 5MB)
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="font-body">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={isSubmitting}
                className="font-body min-h-[300px]"
                required
              />
              <p className="text-xs text-slate-500 font-body">
                Write the full content of your post
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/explore")}
                disabled={isSubmitting}
                className="font-body"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
