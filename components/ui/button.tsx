"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const buttonVariants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-slate-200 hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "hover:bg-slate-100",
  link: "underline-offset-4 hover:underline text-indigo-600",
  glass: "bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 text-slate-800",
};

const buttonSizes = {
  default: "h-10 py-2 px-4",
  sm: "h-9 px-3",
  lg: "h-11 px-6",
  icon: "h-10 w-10 p-2",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
