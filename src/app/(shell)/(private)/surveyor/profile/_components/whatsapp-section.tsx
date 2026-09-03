"use client";

import { MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppUpdate } from "./whatsapp-update";
import type { TAuthUser } from "@/interface/auth";

const EMPTY = "তথ্য দেওয়া হয়নি";

type WhatsAppSectionProps = {
  user: TAuthUser | null;
};

export function WhatsAppSection({ user }: WhatsAppSectionProps) {
  const whatsappNumber = user?.whatsappNumber;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            WhatsApp নম্বর
          </span>
          <WhatsAppUpdate user={user} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mt-1 text-sm">
          {whatsappNumber ? whatsappNumber : EMPTY}
        </p>
      </CardContent>
    </Card>
  );
}
