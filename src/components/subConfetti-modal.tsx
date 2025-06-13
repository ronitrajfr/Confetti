"use client";

import type React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { UploadButton } from "~/utils/uploadthing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Plus, Hash, User, ImageIcon } from "lucide-react";

interface ChannelFormData {
  name: string;
  username: string;
  image: string;
}

export default function SubConfettiModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>({
    name: "",
    username: "",
    image: "",
  });

  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: async (data: ChannelFormData) => {
      const payload: Partial<ChannelFormData> = {
        name: data.name,
        username: data.username,
      };

      if (data.image.trim()) {
        payload.image = data.image.trim();
      }

      const res = await fetch("/api/subConfetti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create channel");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebarServers"] });
      setFormData({ name: "", username: "", image: "" });
      setOpen(false);
    },

    onError: (err: any) => {
      console.error("Channel creation failed:", err);
      alert(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChannelMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ChannelFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex items-center justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="gap-2 rounded-full px-6 py-3 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Create Channel
          </Button>
        </DialogTrigger>

        <DialogContent className="border-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Create Channel
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new confetti channel for your community
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preview */}
            <div className="bg-muted/30 border-border/50 flex items-center gap-4 rounded-lg border p-4">
              <Avatar className="ring-background h-12 w-12 shadow-sm ring-2">
                <AvatarImage
                  src={formData.image || "/placeholder.svg"}
                  alt="Channel avatar"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {formData.name.charAt(0).toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate font-medium">
                  {formData.name || "Channel Name"}
                </div>
                <div className="text-muted-foreground truncate text-sm">
                  @{formData.username || "username"}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Hash className="h-4 w-4" />
                  Channel Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter channel name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    @
                  </span>
                  <Input
                    id="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange(
                        "username",
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    className="pl-8"
                    required
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Only lowercase letters, numbers, and underscores allowed
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <ImageIcon className="h-4 w-4" />
                  Channel Image (Optional)
                </Label>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const uploadedUrl = res[0]!.url;
                      handleInputChange("image", uploadedUrl);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-11 flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 flex-1 shadow-sm"
                disabled={
                  !formData.name.trim() ||
                  !formData.username.trim() ||
                  createChannelMutation.isPending
                }
              >
                {createChannelMutation.isPending
                  ? "Creating..."
                  : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
