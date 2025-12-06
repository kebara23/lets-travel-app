"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Globe,
  User,
  Lock,
  AlertTriangle,
  Calendar,
  MapPin,
  Plus,
  X,
  Tag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ClientProfile = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  country_code: string | null;
  is_active: boolean | null;
  admin_notes: string | null;
  preferences: string[] | null;
  created_at: string;
  updated_at: string;
};

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "active" | "draft" | "completed";
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const supabase = createClient();
  const userId = params.userId as string;

  const [client, setClient] = useState<ClientProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [originalData, setOriginalData] = useState<{
    fullName: string;
    phone: string;
    countryCode: string;
    adminNotes: string;
    isActive: boolean;
    preferences: string[];
  } | null>(null);

  useEffect(() => {
    if (userId) {
      fetchClientData();
      fetchClientTrips();
    }
  }, [userId]);

  useEffect(() => {
    if (client) {
      const initialFullName = client.full_name || "";
      const initialPhone = client.phone || "";
      const initialCountryCode = client.country_code || "";
      const initialAdminNotes = client.admin_notes || "";
      const initialIsActive = client.is_active !== false;
      const initialPreferences = Array.isArray(client.preferences) ? client.preferences : [];

      setFullName(initialFullName);
      setPhone(initialPhone);
      setCountryCode(initialCountryCode);
      setAdminNotes(initialAdminNotes);
      setIsActive(initialIsActive);
      setPreferences(initialPreferences);

      // Store original data for comparison
      setOriginalData({
        fullName: initialFullName,
        phone: initialPhone,
        countryCode: initialCountryCode,
        adminNotes: initialAdminNotes,
        isActive: initialIsActive,
        preferences: initialPreferences,
      });

      // Reset dirty state when data is loaded
      setIsDirty(false);
    }
  }, [client]);

  // Check for unsaved changes
  useEffect(() => {
    if (!originalData) return;

    const hasChanges =
      fullName !== originalData.fullName ||
      phone !== originalData.phone ||
      countryCode !== originalData.countryCode ||
      adminNotes !== originalData.adminNotes ||
      isActive !== originalData.isActive ||
      JSON.stringify(preferences.sort()) !== JSON.stringify(originalData.preferences.sort());

    setIsDirty(hasChanges);
  }, [fullName, phone, countryCode, adminNotes, isActive, preferences, originalData]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  async function fetchClientData() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .eq("role", "client")
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          variant: "destructive",
          title: "Client not found",
          description: "This client profile does not exist.",
        });
        router.push("/admin/clients");
        return;
      }

      console.log("📥 Fetched client data:", {
        userId,
        preferences: data.preferences,
        preferencesType: typeof data.preferences,
        isArray: Array.isArray(data.preferences),
        preferencesValue: JSON.stringify(data.preferences),
      });

      setClient(data as ClientProfile);
    } catch (error: any) {
      console.error("Error fetching client:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load client profile.",
      });
      router.push("/admin/clients");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchClientTrips() {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("id, title, start_date, end_date, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTrips(data || []);
    } catch (error: any) {
      console.error("Error fetching trips:", error);
      // Don't show toast for trips error, just log it
    }
  }

  async function handleSave() {
    if (!client) return;

    setIsSaving(true);
    try {
      // Prepare update payload
      const updatePayload = {
        full_name: fullName || null,
        phone: phone || null,
        country_code: countryCode || null,
        admin_notes: adminNotes || null,
        preferences: preferences.length > 0 ? preferences : [], // Always send array, even if empty
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      console.log("💾 Saving client profile:", {
        userId,
        preferences: updatePayload.preferences,
        preferencesType: Array.isArray(updatePayload.preferences),
        preferencesLength: updatePayload.preferences.length,
      });

      const { error, data } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", userId)
        .select("preferences"); // Select to verify what was saved

      if (error) {
        console.error("❌ Supabase update error:", error);
        throw error;
      }

      console.log("✅ Profile saved successfully:", {
        savedPreferences: data?.[0]?.preferences,
        savedType: Array.isArray(data?.[0]?.preferences),
      });

      // Update original data to match saved state
      if (originalData) {
        setOriginalData({
          fullName,
          phone,
          countryCode,
          adminNotes,
          isActive,
          preferences,
        });
      }

      // Reset dirty state after successful save
      setIsDirty(false);

      toast({
        title: "Profile updated",
        description: "Client profile has been successfully updated.",
      });

      // Refresh client data
      await fetchClientData();
    } catch (error: any) {
      console.error("💥 Error updating client:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error details:", error.details);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update client profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddTag(tag: string) {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Check if tag already exists (case-insensitive)
    const tagExists = preferences.some(
      (p) => p.toLowerCase() === trimmedTag.toLowerCase()
    );
    if (tagExists) {
      toast({
        variant: "destructive",
        title: "Tag already exists",
        description: `"${trimmedTag}" is already in the list.`,
      });
      return;
    }

    setPreferences([...preferences, trimmedTag]);
    setNewTagInput("");
    // isDirty will be set automatically by useEffect
  }

  function handleRemoveTag(tagToRemove: string) {
    setPreferences(preferences.filter((tag) => tag !== tagToRemove));
    // isDirty will be set automatically by useEffect
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(newTagInput);
    }
  }

  function isCriticalTag(tag: string): boolean {
    const criticalKeywords = ["allergy", "allergic", "vip", "medical", "emergency"];
    return criticalKeywords.some((keyword) =>
      tag.toLowerCase().includes(keyword)
    );
  }

  function getTagColor(tag: string): string {
    if (isCriticalTag(tag)) {
      // Red for allergies/medical, Gold for VIP
      if (tag.toLowerCase().includes("vip")) {
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
      }
      return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
    }
    return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100";
  }

  const quickSuggestions = ["Vegan", "VIP", "Anniversary", "Quiet Room", "Allergy", "Wheelchair Access"];

  async function handlePasswordReset() {
    if (!client) return;

    if (
      !confirm(
        `Are you sure you want to send a password reset email to ${client.email}?`
      )
    ) {
      return;
    }

    setIsSendingReset(true);
    try {
      // Note: This requires service_role key or admin API access
      // Alternative: Use supabase.auth.resetPasswordForEmail if available
      const { error } = await supabase.auth.resetPasswordForEmail(client.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: `A password reset link has been sent to ${client.email}.`,
      });
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          "Failed to send password reset email. This feature may require admin API access.",
      });
    } finally {
      setIsSendingReset(false);
    }
  }

  function getInitials(name: string | null, email: string): string {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  const displayName = client.full_name || client.email.split("@")[0];
  const username = client.username
    ? `@${client.username}`
    : `@${client.email.split("@")[0]}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/clients")}
          className="font-body"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 font-body">
            Client Profile
          </h1>
          <p className="text-slate-600 mt-1 font-body">Manage client information and settings</p>
        </div>
      </div>

      {/* Client Identity Card */}
      <Card className="bg-white border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {getInitials(client.full_name, client.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 font-body">{displayName}</h2>
              <p className="text-slate-600 font-body">{username}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span className="font-body">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span className="font-body">
                      {client.country_code ? `+${client.country_code} ` : ""}
                      {client.phone}
                    </span>
                  </div>
                )}
                {client.country_code && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-4 w-4" />
                    <span className="font-body">{client.country_code.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge
              className={cn(
                "font-body",
                client.is_active !== false
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              )}
              variant="outline"
            >
              {client.is_active !== false ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SECTION A: Editable Information */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="font-body">
              Update client details and internal notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-body">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  // isDirty will be set automatically by useEffect
                }}
                placeholder="Enter full name"
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-body">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  // isDirty will be set automatically by useEffect
                }}
                placeholder="Enter phone number"
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode" className="font-body">
                Country Code
              </Label>
              <Input
                id="countryCode"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  // isDirty will be set automatically by useEffect
                }}
                placeholder="e.g., US, MX, ES"
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes" className="font-body">
                Admin Internal Notes
              </Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => {
                  setAdminNotes(e.target.value);
                  // isDirty will be set automatically by useEffect
                }}
                placeholder="Private notes about this client (only visible to admins)"
                rows={6}
                className="font-body"
              />
              <p className="text-xs text-muted-foreground font-body">
                These notes are private and only visible to admin staff.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="w-full font-body"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {isDirty && (
              <p className="text-xs text-amber-600 font-body text-center">
                ⚠️ You have unsaved changes
              </p>
            )}
          </CardContent>
        </Card>

        {/* NEW SECTION: Guest Preferences & References */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Guest Preferences & References
            </CardTitle>
            <CardDescription className="font-body">
              Service tags and special requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Tags */}
            <div className="space-y-2">
              <Label className="font-body">Service Tags</Label>
              {preferences.length === 0 ? (
                <p className="text-sm text-muted-foreground font-body italic">
                  No tags added yet. Add preferences or special requirements below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-md bg-slate-50 min-h-[60px]">
                  {preferences.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "font-body flex items-center gap-1.5 pr-1.5",
                        getTagColor(tag)
                      )}
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Add Tag Input */}
            <div className="space-y-2">
              <Label htmlFor="newTag" className="font-body">
                Add New Tag
              </Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter..."
                  className="font-body"
                />
                <Button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <Label className="font-body text-xs text-muted-foreground">
                Quick Add
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => {
                  const alreadyAdded = preferences.some(
                    (p) => p.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTag(suggestion)}
                      disabled={alreadyAdded}
                      className={cn(
                        "font-body text-xs h-7",
                        alreadyAdded && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {suggestion}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Save Preferences Button */}
            <div className="pt-2 border-t border-slate-200">
              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                variant="outline"
                size="sm"
                className="w-full font-body"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
              {isDirty && (
                <p className="text-xs text-amber-600 font-body text-center mt-2">
                  ⚠️ Unsaved changes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SECTION B: Security & Access */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Access
            </CardTitle>
            <CardDescription className="font-body">
              Manage account status and password reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="font-body">
                    User Active
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    Deactivate to prevent login access
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    setIsActive(checked);
                    // isDirty will be set automatically by useEffect
                    // Auto-save on toggle (optional - you can remove this if you prefer manual save)
                    // setTimeout(() => {
                    //   handleSave();
                    // }, 100);
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-body">Password Reset</Label>
                <p className="text-sm text-muted-foreground font-body">
                  Send a password reset email to {client.email}
                </p>
                <Button
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={isSendingReset}
                  className="w-full font-body"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingReset ? "Sending..." : "Send Password Reset Email"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION C: Trip History */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="font-body flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Trip History
          </CardTitle>
          <CardDescription className="font-body">
            All trips associated with this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-body">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold">No trips found</p>
              <p className="text-sm">This client has no trips yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/trips/${trip.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 font-body">{trip.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="font-body">
                          {new Date(trip.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="font-body">→</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="font-body">
                          {new Date(trip.end_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "font-body",
                      trip.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : trip.status === "completed"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    )}
                    variant="outline"
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

