import React, { useEffect, useRef } from "react";

/**
 * Custom hook to handle clicks outside a specified element.
 * Replaces MUI's ClickAwayListener functionality.
 * 
 * @param handler Callback function to execute when a click outside is detected.
 * @param enabled Whether the hook should be active or not.
 * @returns A ref to attach to the element you want to monitor.
 */
export function useClickOutside(
  handler: () => void,
  enabled: boolean = true
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

/**
 * Wrapper component that mimics MUI's ClickAwayListener API
 * for easier migration from MUI components.
 */
export function ClickAwayListener({ 
  onClickAway, 
  children,
  style,
  css,
  ...props
}: { 
  onClickAway: () => void; 
  children: React.ReactNode;
  style?: React.CSSProperties;
  css?: any; // For backward compatibility with Emotion css prop
  [key: string]: any;
}) {
  const ref = useClickOutside(onClickAway, true);
  
  // Use style if provided, otherwise use css (for backward compatibility)
  const containerStyle = style || (css ? {} : { display: 'contents' });
  
  return (
    <div ref={ref} style={containerStyle} {...props}>
      {children}
    </div>
  );
}

