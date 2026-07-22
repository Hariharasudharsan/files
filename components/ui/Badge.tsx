import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
  
  const variants = {
    default: "bg-primary-900 text-white",
    secondary: "bg-primary-100 text-primary-900",
    outline: "text-primary-900 border border-primary-200",
    accent: "bg-accent-500 text-white"
  }

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
  )
}
