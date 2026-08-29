import * as z from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।").optional(),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।")
    .or(z.literal(""))
    .optional(),
  whatsappNumber: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক ১১ সংখ্যার WhatsApp নম্বর দিন।")
    .or(z.literal(""))
    .optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
});

export type UpdateMeFormValues = z.infer<typeof updateMeSchema>;
