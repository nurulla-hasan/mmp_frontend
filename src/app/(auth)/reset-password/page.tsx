"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { FormInput } from "@/components/common/form-input";

const formSchema = z
  .object({
    password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"),
    confirmPassword: z.string().min(1, "অনুগ্রহ করে পাসওয়ার্ড নিশ্চিত করুন।"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড মিলছে না।",
    path: ["confirmPassword"],
  });

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
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
          <h1 className="text-2xl font-semibold tracking-tight">নতুন পাসওয়ার্ড সেট করুন</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            নিচে আপনার নতুন পাসওয়ার্ড দিন।
          </p>
        </div>

        <FieldGroup>
          <FormInput
            control={form.control}
            name="password"
            label="পাসওয়ার্ড"
            placeholder="আপনার পাসওয়ার্ড দিন"
            type="password"
            autoComplete="new-password"
          />

          <FormInput
            control={form.control}
            name="confirmPassword"
            label="পাসওয়ার্ড নিশ্চিত করুন"
            placeholder="আপনার পাসওয়ার্ড নিশ্চিত করুন"
            type="password"
            autoComplete="new-password"
          />

          <Field>
            <Button type="submit" size="lg" className="w-full">
              পাসওয়ার্ড রিসেট করুন
            </Button>
          </Field>

          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              লগইনে ফিরে যান
            </Link>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
