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
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
            />
            <FieldDescription>
              Use at least eight characters.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </Field>

          <Field>
            <Button type="submit" size="lg" className="w-full">
              Reset password
            </Button>
          </Field>

          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
