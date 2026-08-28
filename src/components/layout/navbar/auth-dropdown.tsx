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
import type { TAuthUser } from "@/interface/auth";
import {
  surveyorNavigation,
  userNavigation,
  type NavigationItem,
} from "@/constants/nav-links";
import { logoutAction } from "@/app/(auth)/_actions/auth.action";

const getNavigationByRole = (role: TAuthUser["role"]): NavigationItem[] => {
  switch (role) {
    case "SURVEYOR":
      return surveyorNavigation;
    default:
      return userNavigation;
  }
};

export function AuthDropdown({
  isAuthenticated,
  user,
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
              className={cn("lg:hidden")}
            >
              <AvatarImage
                src={user?.imageUrl || "/assets/fallback-avatar.png"}
              />
              <AvatarFallback>
                {getInitials(user?.name || "") || <UserRound />}
              </AvatarFallback>
            </Avatar>

            {/* Desktop Avatar (Large Size) */}
            <Avatar
              size="lg"
              className={cn("hidden lg:flex")}
            >
              <AvatarImage
                src={user?.imageUrl || "/assets/fallback-avatar.png"}
              />
              <AvatarFallback>
                {getInitials(user?.name || "") || <UserRound />}
              </AvatarFallback>
            </Avatar>
          </>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {user?.name && (
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

          {user?.name && <DropdownMenuSeparator />}

          <DropdownMenuGroup>
            {getNavigationByRole(user?.role ?? "USER").map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link href={item.href} className="flex items-center gap-2" />
                  }
                >
                  {Icon && <Icon className="size-4 text-muted-foreground" />}
                  {item.title}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              logoutAction();
            }}
          >
            <LogOut />
            লগআউট
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}