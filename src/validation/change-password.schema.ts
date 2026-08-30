import * as z from "zod";

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।")
      .max(72),
    confirmPassword: z.string().min(1, "নতুন পাসওয়ার্ডটি আবার লিখুন।"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.oldPassword || data.oldPassword !== data.newPassword, {
    message: "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের সমান হতে পারবে না।",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
