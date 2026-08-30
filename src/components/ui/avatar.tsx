"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  size = "default",
  isPro = false,
  isSubscribed,
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg" | "xl" | "2xl";
  isPro?: boolean;
  isSubscribed?: boolean;
}) {
  const hasPro = isPro || isSubscribed;

  if (hasPro) {
    return (
      <div
        data-slot="avatar-pro-ring"
        data-size={size}
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full select-none p-[2px]",
          "bg-[conic-gradient(from_45deg,#FF2E93_0%,#FF8A00_20%,#FFDD00_40%,#00E676_60%,#00B0FF_80%,#9C27B0_90%,#FF2E93_100%)]",
          "size-8",
          "data-[size=sm]:size-6",
          "data-[size=lg]:size-10",
          "data-[size=xl]:size-20",
          "data-[size=2xl]:size-24",
          className,
        )}
      >
        <div className="flex size-full items-center justify-center rounded-full bg-background p-[2px]">
          <AvatarPrimitive.Root
            data-slot="avatar"
            data-size={size}
            className="group/avatar relative flex size-full shrink-0 rounded-full select-none"
            {...props}
          />
        </div>
      </div>
    );
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none",
        "data-[size=sm]:size-6",
        "data-[size=lg]:size-10",
        "data-[size=xl]:size-20",
        "data-[size=2xl]:size-24",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  ...props
}: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      src={src || "/assets/fallback-avatar.png"}
      className={cn(
        "aspect-square size-full rounded-full bg-background object-cover",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        "bg-muted text-sm font-semibold text-muted-foreground",
        "group-data-[size=sm]/avatar:text-xs",
        "group-data-[size=xl]/avatar:text-xl",
        "group-data-[size=2xl]/avatar:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full",
        "bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full",
        "bg-muted text-sm text-muted-foreground ring-2 ring-background",
        "group-has-data-[size=lg]/avatar-group:size-10",
        "group-has-data-[size=sm]/avatar-group:size-6",
        "[&>svg]:size-4",
        "group-has-data-[size=lg]/avatar-group:[&>svg]:size-5",
        "group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
