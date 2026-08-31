import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("একটি সঠিক ইমেইল ঠিকানা দিন।"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email("একটি সঠিক ইমেইল ঠিকানা দিন।"),
    otp: z.string().trim().regex(/^\d{6}$/, "৬-ডিজিটের ভেরিফিকেশন কোড দিন।"),
    password: z
      .string()
      .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।")
      .max(72),
    confirmPassword: z.string().min(1, "পাসওয়ার্ডটি আবার লিখুন।"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

