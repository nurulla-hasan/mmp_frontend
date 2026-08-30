import * as z from "zod";

const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const updateMeSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।").optional(),
  phone: z
    .string()
    .trim()
    .regex(bdPhoneRegex, "সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা +88017XXXXXXXX)।")
    .or(z.literal(""))
    .optional(),
  whatsappNumber: z
    .string()
    .trim()
    .regex(bdPhoneRegex, "সঠিক WhatsApp নম্বর দিন (যেমন: 017XXXXXXXX বা +88017XXXXXXXX)।")
    .or(z.literal(""))
    .optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  imageUrl: z.string().trim().url("সঠিক ইমেজ লিঙ্ক দিন।").or(z.literal("")).optional(),
});

export type UpdateMeFormValues = z.infer<typeof updateMeSchema>;
