import React, { useState, useRef, useCallback, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RippleButton = forwardRef(function RippleButton({
  children,
  onClick,
  className,
  rippleClassName,
  variant = "default",
  size = "default",
  disabled = false,
  scale = 10,
  ...props
}, ref) {
  const [ripples, setRipples] = useState([]);
  const internalRef = useRef(null);
  const buttonRef = ref || internalRef;

  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = useCallback((event) => {
    if (disabled) return;
    createRipple(event);
    onClick?.(event);
  }, [createRipple, onClick, disabled]);

  const variantStyles = {
    default: "bg-[#1C3693] text-white hover:bg-[#1C3693]/90",
    outline: "border border-gray-300 bg-white text-[#656C77] hover:bg-gray-50",
    ghost: "text-[#656C77] hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  const rippleColors = {
    default: "bg-white/30",
    outline: "bg-[#1C3693]/20",
    ghost: "bg-gray-400/30",
    destructive: "bg-white/30",
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-2",
        "whitespace-nowrap rounded-full text-sm font-medium",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3693]/20 focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
        variantStyles[variant],
        sizes[size],
        className
      )}
      style={{ fontFamily: "Archivo, sans-serif" }}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "absolute rounded-full size-5 pointer-events-none",
            rippleColors[variant],
            rippleClassName
          )}
          style={{
            top: ripple.y - 10,
            left: ripple.x - 10,
          }}
        />
      ))}
    </motion.button>
  );
});

export default RippleButton;
