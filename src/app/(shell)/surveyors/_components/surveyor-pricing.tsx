import { Banknote, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorPricing({
  surveyor,
}: {
  surveyor: TSurveyorProfile;
}) {
  const fullName = surveyor.user?.name || surveyor.fullName || "সার্ভেয়ার";
  const whatsappNumber = surveyor.user?.whatsappNumber || surveyor.whatsappNumber || "";
  const pricedServices = (surveyor.surveyorServices ?? []).filter(
    (s) => s.startingPrice != null,
  );

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          সেবার মূল্য তালিকা
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {pricedServices.length > 0 ? (
          <div className="space-y-2">
            {pricedServices.map((service, idx) => (
              <div
                key={`${service.service.slug}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5"
              >
                <span className="text-sm text-foreground">
                  {service.service.name}
                </span>
                <Badge variant="success">
                  <Banknote className="size-3" />
                  ৳{service.startingPrice!.toLocaleString("bn-BD")} থেকে
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            এখনো মূল্য নির্ধারণ করা হয়নি। সরাসরি সার্ভেয়ারের সাথে যোগাযোগ করে
            বিস্তারিত জেনে নিন।
          </p>
        )}

        <div>
          {whatsappNumber ? (
            <Button
              className="w-full"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/880${whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(`হ্যালো, আমি Mouza Map Pro থেকে ${fullName} এর সেবার মূল্য তালিকা দেখেছি। আরও বিস্তারিত জানতে চাই।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle className="size-4" />
              WhatsApp-এ যোগাযোগ
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              disabled
            >
              যোগাযোগের মাধ্যম নেই
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
