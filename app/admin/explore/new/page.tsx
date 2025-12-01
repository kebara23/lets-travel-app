"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "", subtitle: "", category: "Destination",
    image_url: "", content: "", visibility: "global", target_user_id: ""
  });

  useEffect(() => {
    const getClients = async () => {
      const { data } = await supabase.from("users").select("id, full_name").eq("role", "client");
      if (data) setClients(data);
    };
    getClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload: any = { ...formData };
    if (payload.visibility === 'global') delete payload.target_user_id;

    const { error } = await supabase.from("explore_posts").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Created!" });
      router.push("/admin/explore");
    }
    setLoading(false);
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
          <Label>Image URL</Label>
          <Input placeholder="https://..." onChange={e => setFormData({...formData, image_url: e.target.value})} />
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
            <Label>Select Guest</Label>
            <select className="w-full mt-1 p-2 border rounded" onChange={e => setFormData({...formData, target_user_id: e.target.value})}>
              <option value="">Choose...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
        )}

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
