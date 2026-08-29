import * as z from "zod";

export const surveyorServiceFormSchema = z.object({
  serviceId: z.string(),
  slug: z.string(),
  name: z.string(),
  startingPrice: z.coerce
    .number()
    .min(0, "মূল্য ০ বা তার বেশি হতে হবে।")
    .optional()
    .nullable(),
});

export const serviceAreaFormSchema = z.object({
  district: z.string(),
  upazilas: z.array(z.string()).default([]),
});

export const surveyorProfileSchema = z.object({
  fullName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন।"),
  primaryDistrict: z.string().min(1, "জেলা নির্বাচন করুন।"),
  primaryUpazila: z.string().min(1, "উপজেলা/থানা লিখুন।"),
  headline: z.string().min(2, "শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  experienceYears: z.coerce
    .number()
    .int("পূর্ণ সংখ্যা দিন।")
    .min(0, "০ বা তার বেশি হতে হবে।")
    .max(50, "৫০ এর বেশি হতে পারবে না।"),
  bio: z.string().max(500, "৫০০ অক্ষরের বেশি হতে পারবে না।").optional(),
  serviceAreas: z
    .array(serviceAreaFormSchema)
    .min(1, "কমপক্ষে একটি সেবার এলাকা নির্বাচন করুন।"),
  whatsappNumber: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক ১১ সংখ্যার নম্বর দিন।")
    .or(z.literal(""))
    .optional(),
  services: z
    .array(surveyorServiceFormSchema)
    .min(1, "কমপক্ষে একটি সেবা নির্বাচন করুন।"),
});

export type SurveyorProfileFormValues = z.infer<typeof surveyorProfileSchema>;

export const updateProfessionalInfoSchema = z.object({
  headline: z.string().min(2, "শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  experienceYears: z.coerce
    .number()
    .int("পূর্ণ সংখ্যা দিন।")
    .min(0, "০ বা তার বেশি হতে হবে।")
    .max(50, "৫০ এর বেশি হতে পারবে না।"),
  bio: z.string().max(1000, "১০০০ অক্ষরের বেশি হতে পারবে না।").optional(),
});

export type UpdateProfessionalInfoFormValues = z.infer<
  typeof updateProfessionalInfoSchema
>;

export const updateServiceAreasSchema = z.object({
  serviceAreas: z
    .array(serviceAreaFormSchema)
    .min(1, "কমপক্ষে একটি সেবার এলাকা নির্বাচন করুন।"),
});

export type UpdateServiceAreasFormValues = z.infer<
  typeof updateServiceAreasSchema
>;

export const updateServicesSchema = z.object({
  services: z
    .array(surveyorServiceFormSchema)
    .min(1, "কমপক্ষে একটি সেবা নির্বাচন করুন।"),
});

export type UpdateServicesFormValues = z.infer<typeof updateServicesSchema>;
