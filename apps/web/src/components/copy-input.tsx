"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Copy, RotateCw } from "lucide-react";
import * as React from "react";

interface CopyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onUpdate?: () => void;
  onCopy?: () => void;
}

export function CopyInput({
  value,
  className,
  onUpdate,
  onCopy,
  ...props
}: CopyInputProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);

    onCopy?.();
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative flex items-center">
      <Input
        value={value}
        className={cn("pr-24 cursor-pointer", className)}
        onClick={handleCopy}
        {...props}
        readOnly
      />
      <div className="absolute right-4 flex">
        {onUpdate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onUpdate}
            className="h-full px-3 transition-opacity hover:bg-transparent w-8"
          >
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-full px-3 transition-opacity hover:bg-transparent w-8"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
