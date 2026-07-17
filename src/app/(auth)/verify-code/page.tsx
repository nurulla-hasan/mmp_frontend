"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const formSchema = z.object({
  code: z.string().length(6, "কোডটি ৬ সংখ্যার হতে হবে।"),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">আপনার ইমেইল ভেরিফাই করুন</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            আপনার ইমেইলে পাঠানো 6-ডিজিটের কোডটি লিখুন।
          </p>
        </div>

        <FieldGroup>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="text-center">ভেরিফিকেশন কোড</FieldLabel>
                <div className="flex justify-center">
                  <InputOTP
                    {...field}
                    maxLength={6}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldDescription className="text-center">
                  আপনার ইমেইল ইনবক্স চেক করুন।
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" size="lg" className="w-full">
              কোড ভেরিফাই করুন
            </Button>
          </Field>

          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              লগইনে ফিরে যান
            </Link>
            <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
              কোড পুনরায় পাঠান
            </button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
