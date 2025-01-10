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
import { useI18n } from "@/locales/client";
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
  const t = useI18n();
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
              <DialogHeader className="mb-4">
                <DialogTitle className="mb-2">
                  {t("dangerZone.dialog.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("dangerZone.dialog.description")}
                </DialogDescription>
              </DialogHeader>

              <Input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder={t("dangerZone.dialog.placeholder")}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("dangerZone.dialog.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteText !== "DELETE"}
                >
                  {t("dangerZone.dialog.confirm")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
