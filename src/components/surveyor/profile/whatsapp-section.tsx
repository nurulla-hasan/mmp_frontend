"use client";

import { MessageCircle } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurveyorProfileFormValues } from "./surveyor-profile.schema";

export function WhatsAppSection() {
  const { control } = useFormContext<SurveyorProfileFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          WhatsApp নম্বর
        </CardTitle>
        <FieldDescription>
          ক্লায়েন্টরা আপনার সাথে সরাসরি WhatsApp-এ যোগাযোগ করতে পারবেন।
          নম্বরটি প্রোফাইল ও সার্ভেয়ার তালিকায় প্রকাশিত হবে।
        </FieldDescription>
      </CardHeader>
      <CardContent>
        <Controller
          name="whatsappNumber"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>WhatsApp নম্বর (ঐচ্ছিক)</FieldLabel>
              <Input
                {...field}
                id={field.name}
                value={field.value ?? ""}
                type="tel"
                aria-invalid={fieldState.invalid}
                placeholder="17XXXXXXXXX"
                className="max-w-xs"
              />
              <FieldDescription>
                ১১ সংখ্যার নম্বর দিন। যেমন: 017123456789
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}
