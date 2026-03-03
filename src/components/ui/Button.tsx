import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-slate-900 hover:bg-slate-50 shadow-sm border border-slate-200",
    outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-600 hover:text-blue-600 p-0 shadow-none hover:bg-transparent underline-offset-4 hover:underline",
  };

  const sizes = {
    sm: "text-sm py-2 px-4",
    md: "text-base py-3 px-6",
    lg: "text-lg py-4 px-8",
    icon: "h-9 w-9 p-0",
  };

  // Special case for link variant which doesn't need size padding if it's just text
  const sizeStyles = variant === 'link' ? '' : sizes[size];
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizeStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
