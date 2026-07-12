"use client";

import Link from "next/link";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Page() {
  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code" className="text-center">Verification code</FieldLabel>
            <div className="flex justify-center">
              <InputOTP maxLength={6} id="code" name="code">
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
              Check your email inbox for the code.
            </FieldDescription>
          </Field>

          <Field>
            <Button type="submit" size="lg" className="w-full">
              Verify code
            </Button>
          </Field>

          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
            <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
              Resend code
            </button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
