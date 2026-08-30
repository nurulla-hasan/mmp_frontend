import { Bell, UserRound } from "lucide-react";
import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAuthUser } from "@/interface/auth";
import { getMe } from "@/services/auth.service";
import { cn, getInitials } from "@/lib/utils";

export default async function AdminHeader() {
  let user: TAuthUser | undefined;
  const result = await getMe();
  if (result.success) user = result.data.user;

  // const handleLogout = () => {
  //   logoutAction();
  // };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-sidebar px-4 sm:px-6">
      <SidebarTrigger className="lg:hidden" />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <Button variant="ghost" size="icon" aria-label="নোটিফিকেশন">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <>
              {/* Mobile Avatar (Default Size) */}
              <Avatar isPro={user?.isSubscribed} className={cn("lg:hidden")}>
                <AvatarImage
                  src={user?.imageUrl || "/assets/fallback-avatar.png"}
                />
                <AvatarFallback>
                  {getInitials(user?.name || "") || <UserRound />}
                </AvatarFallback>
              </Avatar>

              {/* Desktop Avatar (Large Size) */}
              <Avatar isPro={user?.isSubscribed} size="lg" className={cn("hidden lg:flex")}>
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
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/" />}
                render={<Link href="/admin/profile" />}
                className="flex items-center gap-2"
              >
                <UserRound className="size-4" />
                প্রোফাইল
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
