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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload: any = { ...formData };
      if (payload.visibility === 'global') delete payload.target_user_id;
      
      // Note: File upload logic should be handled here
      // For now, we'll just use the image_url
      // When you implement cloud upload, replace image_url with the uploaded URL
      if (selectedFile) {
        // TODO: Upload file to cloud storage and get URL
        // const uploadedUrl = await uploadToCloud(selectedFile);
        // payload.image_url = uploadedUrl;
        toast({
          title: "File Selected",
          description: `File "${selectedFile.name}" is ready. Cloud upload logic needs to be implemented.`,
        });
      }

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
            <p className="text-xs text-slate-500 mt-2 font-body">
              File selected: {selectedFile.name}. Upload will be handled when you save.
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
          {loading ? "Saving..." : "Publish"}
        </Button>
      </form>
    </div>
  );
}
