"use client";

import { ArrowRight } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function PrimaryButton({
  children,
  className = "",
  icon,
  fullWidth,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={[
        "primary-button",
        fullWidth ? "w-full" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span>{children}</span>
      {icon ?? <ArrowRight size={18} strokeWidth={2.4} />}
    </button>
  );
}
