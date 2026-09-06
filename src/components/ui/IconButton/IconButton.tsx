"use client";

import styles from "./IconButton.module.css";

type IconButtonVariant = "primary" | "tertiary" | "danger" | "neutral";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function IconButton({
  variant = "neutral",
  size = "md",
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={[styles.btn, styles[variant], styles[size], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
