"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
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
          <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <FieldGroup>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

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
