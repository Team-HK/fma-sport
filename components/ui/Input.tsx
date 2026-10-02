import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-medium text-destructive">
      {children}
    </p>
  );
}
