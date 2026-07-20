import { Banknote, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TSurveyorProfile } from "@/types/surveyor-profile.type";

export function SurveyorPricing({
  surveyor,
}: {
  surveyor: TSurveyorProfile;
}) {
  const pricedServices = surveyor.services.filter(
    (s) => s.startingPrice != null,
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">
        সেবার মূল্য তালিকা
      </h2>

      {pricedServices.length > 0 ? (
        <div className="mt-3 space-y-2">
          {pricedServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">
                {service.name}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                <Banknote className="size-3.5" />
                ৳{service.startingPrice!.toLocaleString("bn")} থেকে
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          এখনো মূল্য নির্ধারণ করা হয়নি। সরাসরি সার্ভেয়ারের সাথে যোগাযোগ করে
          বিস্তারিত জেনে নিন।
        </p>
      )}

      <div className="mt-4">
        {surveyor.whatsappNumber ? (
          <Button
            className="w-full"
            nativeButton={false}
            render={
              <a
                href={`https://wa.me/${surveyor.whatsappNumber}?text=${encodeURIComponent(`হ্যালো, আমি Mouza Map Pro থেকে ${surveyor.fullName} এর সেবার মূল্য তালিকা দেখেছি। আরও বিস্তারিত জানতে চাই।`)}`}
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
    </section>
  );
}
