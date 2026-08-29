import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorVerification({
  verification,
}: {
  verification?: TSurveyorProfile["verification"];
}) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="size-4 text-primary" />
          ভেরিফিকেশন
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div>
            <Badge variant="success">
              <BadgeCheck className="size-3.5" />
              পরিচয় যাচাইকৃত
            </Badge>
          </div>
          <div>
            <Badge variant="success">
              <BadgeCheck className="size-3.5" />
              পেশাগত তথ্য যাচাইকৃত
            </Badge>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {verification?.note ||
            "পরিচয় ও জমা দেওয়া পেশাগত তথ্য Mouza Map Pro কর্তৃক যাচাই করা হয়েছে।"}
        </p>
      </CardContent>
    </Card>
  );
}
