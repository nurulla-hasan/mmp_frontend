import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function AccountSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>অ্যাকাউন্ট সেটিংস</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>থিম</Label>
            <p className="text-xs text-muted-foreground">
              লাইট বা ডার্ক মোড বেছে নিন
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>নিরাপত্তা</Label>
            <p className="text-xs text-muted-foreground">
              পাসওয়ার্ড পরিবর্তন করুন
            </p>
          </div>
          {/* TODO: wire up password change flow */}
          <Button variant="outline" size="sm">
            পরিবর্তন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
