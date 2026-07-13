"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { ImageCropDialog } from "@/components/shared/image-crop-dialog";
import { DISTRICT_OPTIONS, type FormValues } from "./schema";

export function PersonalInfoSection() {
  const { control } = useFormContext<FormValues>();
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-primary">ব্যক্তিগত তথ্য, ঠিকানা ও পেশাগত তথ্য</p>

      <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
        <Controller
          name="profileImage"
          control={control}
          render={({ field: { value, onChange }, fieldState }) => (
            <>
              <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
                <FieldLabel htmlFor="profileImage">প্রোফাইল ছবি (ঐচ্ছিক)</FieldLabel>
                <div className="relative">
                  <label
                    htmlFor="profileImage"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed px-4 py-6 transition-colors hover:bg-muted/50"
                  >
                    {value ? (
                      <div className="flex items-center gap-4">
                        <Image
                          src={URL.createObjectURL(value)}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="size-16 rounded-full object-cover"
                          unoptimized
                        />
                        <div className="flex flex-col gap-0.5 pr-10">
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {value.name}
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            (পুনরায় নির্বাচন করতে ক্লিক করুন)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6 text-muted-foreground"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M20 21c0-2.17-2.67-4-8-4s-8 1.83-8 4"/></svg>
                        </div>
                        <span className="text-sm text-muted-foreground">ছবি নির্বাচন করুন</span>
                      </div>
                    )}
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const src = URL.createObjectURL(file);
                          setCropImageSrc(src);
                          setCropDialogOpen(true);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {value && (
                    <button
                      type="button"
                      onClick={() => onChange(undefined)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      title="ছবি মুছুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>

              {cropImageSrc && (
                <ImageCropDialog
                  open={cropDialogOpen}
                  imageSrc={cropImageSrc}
                  onClose={() => {
                    setCropDialogOpen(false);
                    URL.revokeObjectURL(cropImageSrc);
                    setCropImageSrc(null);
                  }}
                  onCropComplete={(croppedFile) => {
                    onChange(croppedFile);
                    URL.revokeObjectURL(cropImageSrc!);
                    setCropImageSrc(null);
                  }}
                />
              )}
            </>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>পুরো নাম</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="আপনার পুরো নাম"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>মোবাইল নম্বর</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                aria-invalid={fieldState.invalid}
                placeholder="01XXXXXXXXX"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>ইমেইল</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="district"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>জেলা</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {DISTRICT_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="upazila"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>উপজেলা / থানা</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="আপনার উপজেলা বা থানা"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="experience"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                অভিজ্ঞতা (বছর)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                max={50}
                aria-invalid={fieldState.invalid}
                placeholder="যেমন: ৫"
                value={field.value ?? ""}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="nid"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>NID নম্বর</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="১০, ১৩ বা ১৭ সংখ্যার NID"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="certificate"
          control={control}
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
              <FieldLabel htmlFor={field.name}>
                সার্টিফিকেট (যদি থাকে)
              </FieldLabel>
              <div className="relative">
                <label
                  htmlFor={field.name}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed px-4 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    {value ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pr-8">
                    {value ? (
                      <>
                        <span className="text-sm font-medium text-foreground line-clamp-1">{value.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (পরিবর্তন করতে ক্লিক করুন)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-foreground">ফাইল আপলোড করুন</span>
                        <span className="text-xs text-muted-foreground">
                          ক্লিক করে ফাইল নির্বাচন করুন
                        </span>
                      </>
                    )}
                  </div>
                  <Input
                    id={field.name}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                  />
                </label>
                {value && (
                  <button
                    type="button"
                    onClick={() => onChange(undefined)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    title="ফাইল মুছুন"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </div>
              <FieldDescription>
                PDF, JPG বা PNG ফরম্যাটে সার্টিফিকেট আপলোড করুন।
              </FieldDescription>
            </Field>
          )}
        />

      </div>
    </div>
  );
}
