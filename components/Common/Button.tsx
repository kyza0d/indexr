
import React, { ButtonHTMLAttributes } from 'react';
import { concat } from "utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "normal";
}

const sizes = {
  small: "inline-flex h-fit w-fit items-center justify-center gap-2 rounded-[9px] px-4 py-2 text-sm font-semibold",
  medium: "inline-flex h-fit w-fit items-center justify-center gap-2 rounded-[9px] px-10 py-3 text-sm",
  large: "inline-flex items-center justify-center gap-2 rounded-[9px] bg-purple-800 text-lg",
};

const variants = {
  primary: "bg-blue text-brightwhite h-fit w-fit text-3xl",
  secondary: "h-fit w-fit bg-blue-800 text-3xl",
  normal: "h-fit w-fit text-3xl text-white",
};

export const Button = ({ children, size = "medium", variant = "normal", className, ...props }: ButtonProps) => {
  return (
    <button className={concat(variants[variant], sizes[size], className)} {...props} >
      {children}
    </button>
  );
};
