import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Button } from "./button";

const buttonVariants = cva(
  "relative font-mono text-base px-4 py-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90 border border-black",
        secondary:
          "bg-background text-primary border border-primary hover:bg-primary/10 hover:bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface OutlinedButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const OutlinedButton = ({
  children,
  onClick,
  className,
  variant,
}: OutlinedButtonProps) => {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "absolute left-[5px] top-[5px] h-full w-full border",
          variant === "secondary" ? "border-primary" : "border-white",
        )}
      />

      <Button
        onClick={onClick}
        className={cn(buttonVariants({ variant }), className)}
      >
        {children}
      </Button>
    </div>
  );
};

export default OutlinedButton;
