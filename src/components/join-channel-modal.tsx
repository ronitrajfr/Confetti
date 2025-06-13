"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Hash, UserPlus } from "lucide-react";

interface JoinChannelProps {
  channelId: string;
}

export default function JoinChannelModal({ channelId }: JoinChannelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const queryClient = useQueryClient();

  const joinChannelMutation = useMutation({
    mutationKey: ["members", channelId],
    mutationFn: async () => {
      // Match the exact request format expected by the backend
      const payload = {
        id: channelId,
      };

      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 401) {
          throw new Error("You must be logged in to join a channel.");
        } else {
          throw new Error(errorData.error || "Failed to join channel");
        }
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch members queries
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
      // Refresh the page to show the channel content
      router.refresh();
    },
    onError: (err) => {
      console.error("Failed to join channel:", err);
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    },
  });

  const handleJoin = () => {
    joinChannelMutation.mutate();
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      router.push("/");
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="border-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Join Channel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Join this confetti channel to access its content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-muted/30 border-border/50 flex items-center gap-4 rounded-lg border p-4">
            <Avatar className="ring-background h-12 w-12 shadow-sm ring-2">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                <Hash className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate font-medium">
                Channel ID: {channelId}
              </div>
              <div className="text-muted-foreground truncate text-sm">
                You need to join to view content
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-muted-foreground text-sm">
            <p>
              By joining this channel, you'll be added as a guest member. You'll
              be able to view all content shared in this channel.
            </p>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="h-11 flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              className="h-11 flex-1 shadow-sm"
              disabled={joinChannelMutation.isPending}
            >
              {joinChannelMutation.isPending ? (
                "Joining..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Channel
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
