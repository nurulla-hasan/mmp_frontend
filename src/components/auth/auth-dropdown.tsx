"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import type { TAuthUser } from "@/types/auth.types";

const user: TAuthUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "SURVEYOR",
  isSubscribed: true,
};

// Logged in — show avatar + dropdown
const isSurveyor = user.role === "SURVEYOR";

export function AuthDropdown({
  isAuthenticated,
}: {
  isAuthenticated?: boolean;
  user?: TAuthUser;
}) {
  // Not logged in — show login button
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          লগইন
        </Button>
        <Button
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href="/surveyors" />}
        >
          সার্ভেয়ার খুঁজুন
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="outline-none rounded-full focus-visible:ring-3 focus-visible:ring-ring/50"
          render={
            <Button
              variant="ghost"
              className="h-auto w-auto p-0 rounded-full"
              aria-label="প্রোফাইল মেনু"
            />
          }
        >
          <>
            {/* Mobile Avatar (Default Size) */}
            <Avatar
              className={cn(
                "lg:hidden",
                user.isSubscribed &&
                  "bg-conic from-violet-500 via-green-500 to-red-500 p-0.5",
              )}
            >
              <AvatarImage
                src={user.profilePhoto || "/assets/fallback-avatar.png"}
                className={cn(user.isSubscribed && "border-2 border-sidebar")}
              />
              <AvatarFallback 
                className={cn(
                  "size-full", 
                  user.isSubscribed && "border-2 border-sidebar"
                )}
              >
                {getInitials(user.name || "") || <UserRound />}
              </AvatarFallback>
            </Avatar>

            {/* Desktop Avatar (Large Size) */}
            <Avatar
              size="lg"
              className={cn(
                "hidden lg:flex",
                user.isSubscribed &&
                  "bg-conic from-violet-500 via-green-500 to-red-500 p-0.5",
              )}
            >
              <AvatarImage
                src={user.profilePhoto || "/assets/fallback-avatar.png"}
                className={cn(user.isSubscribed && "border-2 border-sidebar")}
              />
              <AvatarFallback 
                className={cn(
                  "size-full", 
                  user.isSubscribed && "border-2 border-sidebar"
                )}
              >
                {getInitials(user.name || "") || <UserRound />}
              </AvatarFallback>
            </Avatar>
          </>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {user.name && (
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          )}

          {user.name && <DropdownMenuSeparator />}

          <DropdownMenuGroup>
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={isSurveyor ? "/surveyor/dashboard" : "/dashboard"}
                  className="flex items-center gap-2"
                />
              }
            >
              ড্যাশবোর্ড
            </DropdownMenuItem>

            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={
                    isSurveyor
                      ? "/surveyor/calculations"
                      : "/dashboard/calculations"
                  }
                  className="flex items-center gap-2"
                />
              }
            >
              ক্যালকুলেশন
            </DropdownMenuItem>

            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={isSurveyor ? "/surveyor/profile" : "/dashboard/profile"}
                  className="flex items-center gap-2"
                />
              }
            >
              প্রোফাইল
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive">
            <LogOut />
            লগআউট
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}