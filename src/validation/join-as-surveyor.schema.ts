import * as z from "zod";

export const joinAsSurveyorSchema = z.object({
  headline: z
    .string()
    .min(3, "পেশাদার শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।")
    .max(120, "পেশাদার শিরোনাম ১২০ অক্ষরের বেশি হতে পারবে না।"),
  experienceYears: z.coerce
    .number()
    .int("অভিজ্ঞতার বছর পূর্ণ সংখ্যা দিন।")
    .min(0, "০ বা তার বেশি হতে হবে।")
    .max(50, "৫০ এর বেশি হতে পারবে না।"),
  bio: z
    .string()
    .max(1000, "পরিচিতি ১০০০ অক্ষরের বেশি হতে পারবে না।")
    .optional()
    .or(z.literal("")),
  certificateUrl: z.string().optional().or(z.literal("")),
  serviceAreas: z
    .array(
      z.object({
        district: z.string().min(1, "জেলা নির্বাচন করুন।"),
        upazilas: z.array(z.string()).default([]),
      }),
    )
    .min(1, "কমপক্ষে একটি সেবার এলাকা নির্বাচন করুন।"),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1, "সার্ভিস নির্বাচন করুন।"),
        name: z.string().optional(),
        startingPrice: z.coerce
          .number()
          .min(0, "প্রারম্ভিক মূল্য ০ বা তার বেশি হতে হবে।"),
      }),
    )
    .min(1, "কমপক্ষে একটি সেবা নির্বাচন করুন।"),
  terms: z.boolean().refine((val) => val === true, "শর্তাবলীতে সম্মতি দেওয়া আবশ্যক।"),
});

export type JoinAsSurveyorFormValues = z.infer<typeof joinAsSurveyorSchema>;
