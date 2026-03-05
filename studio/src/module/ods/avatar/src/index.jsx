import React, { forwardRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ODSAvatar = forwardRef(({
  src,
  alt,
  children,
  className,
  badgeContent,
  badgeProps = {},
  avatarProps = {},
  ...props
}, ref) => {
  const avatar = (
    <Avatar
      ref={ref}
      className={cn(avatarProps.className, className)}
      {...avatarProps}
      {...props}
    >
      {(src || avatarProps.src) && (
        <AvatarImage src={src || avatarProps.src} alt={alt || avatarProps.alt} />
      )}
      <AvatarFallback>{children}</AvatarFallback>
    </Avatar>
  );

  if (badgeContent != null) {
    return (
      <div className="relative inline-block">
        {avatar}
        <Badge
          className={cn("absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center", badgeProps.className)}
          {...badgeProps}
        >
          {badgeContent}
        </Badge>
      </div>
    );
  }

  return avatar;
});

ODSAvatar.displayName = "ODSAvatar";

export default ODSAvatar;
