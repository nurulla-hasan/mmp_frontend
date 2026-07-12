"use client";

import { Menu } from "lucide-react";

import type { NavigationItem } from "@/components/navigation/navigation-config";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DashboardSidebar } from "./dashboard-sidebar";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  navigation: NavigationItem[];
}

export function MobileDrawer({
  open,
  onOpenChange,
  label,
  navigation,
}: MobileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Dashboard navigation</DrawerTitle>
        <DrawerDescription className="sr-only">
          Navigate through the {label.toLowerCase()} dashboard.
        </DrawerDescription>
        <DashboardSidebar
          label={label}
          navigation={navigation}
          onNavigate={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}
