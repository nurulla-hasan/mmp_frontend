import { KeyRound, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function AccountSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>অ্যাকাউন্ট সেটিংস</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Moon className="size-4" />
              </div>
              <div>
                <Label>থিম মোড</Label>
                <p className="text-xs text-muted-foreground">
                  লাইট বা ডার্ক মোড বেছে নিন
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <KeyRound className="size-4" />
              </div>
              <div>
                <Label>নিরাপত্তা</Label>
                <p className="text-xs text-muted-foreground">
                  পাসওয়ার্ড পরিবর্তন করুন
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              পরিবর্তন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
