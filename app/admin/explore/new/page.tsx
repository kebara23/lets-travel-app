"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", subtitle: "", category: "Destination",
    image_url: "", content: "", visibility: "global", target_user_id: "", is_template: false
  });

  // Helper to upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Ensure user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required for upload");

      // Create unique file path: explore-images/TIMESTAMP-filename
      // Sanitizing filename to avoid issues
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `explore-images/${fileName}`;

      // Upload to 'public' bucket (common convention) or check if 'images' exists
      // Let's try 'public' bucket first, assuming it is configured for public access
      // Note: You might need to create this bucket in Supabase dashboard if not exists
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // If bucket 'public' doesn't exist, you might need to create it via SQL or Dashboard
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload image. Please check if 'public' bucket exists in Supabase Storage."
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalImageUrl = formData.image_url;

      // Handle file upload if a file is selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          // Stop submission if upload failed but file was selected
          setLoading(false);
          return; 
        }
      }

      const payload: any = { 
        title: formData.title,
        subtitle: formData.subtitle,
        category: formData.category,
        image_url: finalImageUrl,
        content: formData.content,
        visibility: formData.visibility,
        target_user_id: formData.target_user_id || null,
        is_template: formData.is_template
      };
      
      if (payload.visibility === 'global') payload.target_user_id = null;
      
      // Clean payload to remove empty strings for nullable fields
      if (payload.target_user_id === "") payload.target_user_id = null;
      
      const { error } = await supabase.from("explore_posts").insert(payload);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Experience created!" });
        router.push("/admin/explore");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create experience", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Link href="/admin/explore" className="flex items-center text-slate-500 mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Link>
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Create Insider Experience</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
        <div>
          <Label>Title</Label>
          <Input required placeholder="Ex: Private Dinner" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div>
          <Label>Subtitle / Price</Label>
          <Input placeholder="Ex: $150 USD" onChange={e => setFormData({...formData, subtitle: e.target.value})} />
        </div>
        <div>
          <Label className="font-body">Image</Label>
          <ImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData({...formData, image_url: url})}
            onFileSelect={(file) => setSelectedFile(file)}
          />
          {selectedFile && (
            <p className="text-xs text-green-600 mt-2 font-body flex items-center">
              ✓ File selected: {selectedFile.name} (will be uploaded on publish)
            </p>
          )}
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={v => setFormData({...formData, category: v})} defaultValue="Destination">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Destination">Destination</SelectItem>
              <SelectItem value="Dining">Dining</SelectItem>
              <SelectItem value="Upgrade">Upgrade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Visibility</Label>
          <Select onValueChange={v => setFormData({...formData, visibility: v})} defaultValue="global">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global (All Guests)</SelectItem>
              <SelectItem value="user">Specific Guest (VIP)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.visibility === 'user' && (
          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <Label className="font-body mb-2 block">Select Guest</Label>
            <ClientCombobox
              value={formData.target_user_id}
              onValueChange={(value) => setFormData({...formData, target_user_id: value})}
              placeholder="Search and select a client..."
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_template"
            checked={formData.is_template}
            onChange={(e) => setFormData({...formData, is_template: e.target.checked})}
            className="rounded border-slate-300"
          />
          <Label htmlFor="is_template" className="font-body cursor-pointer">
            Save as Template (Default)
          </Label>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea className="h-32" onChange={e => setFormData({...formData, content: e.target.value})} />
        </div>

        <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
          {loading ? "Uploading & Publishing..." : "Publish"}
        </Button>
      </form>
    </div>
  );
}
