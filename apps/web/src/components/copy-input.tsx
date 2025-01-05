"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import * as React from "react";

interface CopyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export function CopyInput({ value, className, ...props }: CopyInputProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center">
      <Input
        value={value}
        readOnly
        className={cn("pr-12", className)}
        {...props}
      />
      <Button
        onClick={onCopy}
        variant="ghost"
        size="icon"
        className="absolute right-0 h-full px-3 transition-opacity hover:bg-transparent"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
