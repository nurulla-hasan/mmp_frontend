"use client";

import Link from "next/link";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register" | "surveyor" | "forgot";

const copy = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue to Mouza Map Pro.",
    button: "Sign in",
  },
  register: {
    title: "Create your account",
    description: "Register as a general user to manage land-service activity.",
    button: "Create account",
  },
  surveyor: {
    title: "Join as a surveyor",
    description:
      "Create a professional profile. Identity and professional verification will be required later.",
    button: "Create surveyor account",
  },
  forgot: {
    title: "Reset your password",
    description: "Enter your email to receive password recovery instructions.",
    button: "Send reset link",
  },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const content = copy[mode];
  const isLogin = mode === "login";
  const isForgot = mode === "forgot";

  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {content.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {content.description}
          </p>
        </div>

        <FieldGroup>
          {!isLogin && !isForgot && (
            <Field>
              <FieldLabel htmlFor="full-name">Full name</FieldLabel>
              <Input
                id="full-name"
                name="name"
                autoComplete="name"
                placeholder="Enter your full name"
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          {!isForgot && (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Enter your password"
              />
              {!isLogin && (
                <FieldDescription>
                  Use at least eight characters for this visual placeholder.
                </FieldDescription>
              )}
            </Field>
          )}

          {mode === "surveyor" && (
            <Field>
              <FieldLabel htmlFor="service-area">Primary service area</FieldLabel>
              <Input
                id="service-area"
                name="serviceArea"
                placeholder="District or upazila"
              />
              <FieldDescription>
                Professional and identity documents will be reviewed before a
                verified badge is issued.
              </FieldDescription>
            </Field>
          )}

          <Field>
            <Button type="submit" size="lg" className="w-full">
              {content.button}
            </Button>
          </Field>

          <FieldSeparator>Account options</FieldSeparator>

          <Field orientation="horizontal" className="flex-wrap justify-between">
            {isLogin ? (
              <>
                <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
                  Create account
                </Link>
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Already have an account?
              </Link>
            )}
            {mode === "register" && (
              <Link href="/register/surveyor" className="text-sm text-muted-foreground hover:text-foreground">
                Register as surveyor
              </Link>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
