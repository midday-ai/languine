"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface DangerZoneProps {
  onDelete?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function DangerZone({
  onDelete,
  title,
  description,
  buttonText,
}: DangerZoneProps) {
  const [deleteText, setDeleteText] = useState("");
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    if (deleteText === "DELETE") {
      onDelete?.();
      setOpen(false);
    }
  };

  return (
    <div className="mb-4 max-w-screen-xl">
      <Card className="w-full bg-noise border-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-normal mb-2">
                {title}
              </CardTitle>
              <p className="text-sm text-secondary">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">{buttonText}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Please type DELETE to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteText !== "DELETE"}
              >
                Confirm Delete
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
