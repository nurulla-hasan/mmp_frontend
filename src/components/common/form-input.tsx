"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  description?: string;
  disabled?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  maxLength?: number;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type,
  autoComplete,
  description,
  disabled,
  inputMode,
  maxLength,
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <FieldContent>
            {type === "password" ? (
              <PasswordInput
                {...field}
                id={field.name}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                maxLength={maxLength}
                aria-invalid={fieldState.invalid}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                id={field.name}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                aria-invalid={fieldState.invalid}
              />
            ) : (
              <Input
                {...field}
                id={field.name}
                type={type || "text"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                inputMode={inputMode}
                maxLength={maxLength}
                aria-invalid={fieldState.invalid}
              />
            )}
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}
