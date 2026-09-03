"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormInput } from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { ErrorToast } from "@/lib/utils";
import { registerAction } from "../_actions/auth.action";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  email: z.string().email("একটি বৈধ ইমেইল ঠিকানা দিন।"),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"),
});

export default function RegisterPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const result = await registerAction(data);
    if (!result.success) {
      ErrorToast(result.message || "অ্যাকাউন্ট তৈরি করা যায়নি।");
      return;
    }
    router.replace(`/verify-code?email=${encodeURIComponent(data.email)}`);
  }

  function startGoogleLogin() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      ErrorToast("API URL configure করা হয়নি।");
      return;
    }
    setIsGoogleLoading(true);
    window.location.href = `${apiUrl.replace(/\/$/, "")}/auth/google`;
  }

  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            আপনার অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            জমি-সেবা কার্যক্রম পরিচালনার জন্য সাধারণ ব্যবহারকারী হিসেবে নিবন্ধন
            করুন।
          </p>
        </div>
        <FieldGroup>
          <FormInput
            control={form.control}
            name="name"
            label="পূর্ণ নাম"
            placeholder="আপনার পূর্ণ নাম দিন"
            autoComplete="name"
          />
          <FormInput
            control={form.control}
            name="email"
            label="ইমেইল ঠিকানা"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
          <FormInput
            control={form.control}
            name="password"
            label="পাসওয়ার্ড"
            placeholder="আপনার পাসওয়ার্ড দিন"
            type="password"
            autoComplete="new-password"
          />
          <Field>
            <div className="w-full [&>button]:w-full">
              <Button
                type="submit"
                size="lg"
                loading={form.formState.isSubmitting}
              >
                অ্যাকাউন্ট তৈরি করুন
              </Button>
            </div>
          </Field>
          <FieldSeparator>অথবা</FieldSeparator>
          <Field>
            <div className="w-full [&>button]:w-full">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-3"
                onClick={startGoogleLogin}
                loading={isGoogleLoading}
              >
                {!isGoogleLoading && (
                  <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                )}
                Google
              </Button>
            </div>
          </Field>
          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ইতিমধ্যে অ্যাকাউন্ট আছে?
            </Link>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
