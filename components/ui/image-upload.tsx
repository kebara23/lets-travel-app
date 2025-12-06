"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onFileSelect, className }: ImageUploadProps) {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    // Clear file selection when URL is used
    if (selectedFile) {
      setSelectedFile(null);
      setPreview(null);
      onFileSelect?.(null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
          className="font-body"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Paste URL
        </Button>
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          className="font-body"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* URL Mode */}
      {mode === "url" && (
        <div className="space-y-2">
          <Label htmlFor="image-url" className="font-body">Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="font-body"
          />
          {value && (
            <div className="mt-2 relative w-full h-48 border rounded-lg overflow-hidden bg-slate-100">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="space-y-2">
          <Label htmlFor="image-file" className="font-body">Upload Image</Label>
          <input
            ref={fileInputRef}
            id="image-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
            >
              <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 font-body mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 font-body">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-slate-100">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-body">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}







