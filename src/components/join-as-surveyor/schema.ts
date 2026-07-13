import * as z from "zod";

export const SERVICE_OPTIONS = [
  { value: "land-measurement", label: "জমি পরিমাপ" },
  { value: "land-division", label: "জমি ভাগ" },
  { value: "boundary-determination", label: "সীমানা নির্ধারণ" },
  { value: "digital-survey", label: "ডিজিটাল সার্ভে" },
  { value: "mouza-map", label: "মৌজা ম্যাপ সহায়তা" },
] as const;

export const DISTRICT_OPTIONS = [
  { value: "dinajpur", label: "দিনাজপুর" },
  { value: "rangpur", label: "রংপুর" },
  { value: "bogura", label: "বগুড়া" },
  { value: "rajshahi", label: "রাজশাহী" },
  { value: "dhaka", label: "ঢাকা" },
  { value: "chattogram", label: "চট্টগ্রাম" },
  { value: "khulna", label: "খুলনা" },
  { value: "sylhet", label: "সিলেট" },
  { value: "barishal", label: "বরিশাল" },
  { value: "mymensingh", label: "ময়মনসিংহ" },
  { value: "comilla", label: "কুমিল্লা" },
  { value: "gazipur", label: "গাজীপুর" },
  { value: "narayanganj", label: "নারায়ণগঞ্জ" },
  { value: "jessore", label: "যশোর" },
  { value: "pabna", label: "পাবনা" },
  { value: "tangail", label: "টাঙ্গাইল" },
] as const;

export const formSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন।"),
  district: z.string().min(1, "জেলা নির্বাচন করুন।"),
  upazila: z.string().min(1, "উপজেলা/থানা লিখুন।"),
  address: z.string().min(10, "ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে।"),
  experience: z.coerce
    .number()
    .int("পূর্ণ সংখ্যা দিন।")
    .min(0, "০ বা তার বেশি হতে হবে।")
    .max(50, "৫০ এর বেশি হতে পারবে না।"),
  nid: z
    .string()
    .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, "NID নম্বর ১০, ১৩ বা ১৭ সংখ্যার হতে হবে।"),
  profileImage: z.instanceof(File).optional(),
  certificate: z.instanceof(File).optional(),
  services: z
    .array(z.string())
    .min(1, "কমপক্ষে একটি সেবা নির্বাচন করুন।"),
  serviceAreas: z
    .array(z.string())
    .min(1, "কমপক্ষে একটি সেবার এলাকা নির্বাচন করুন।"),
  bio: z.string().max(500, "৫০০ অক্ষরের বেশি হতে পারবে না।").optional(),
  terms: z.boolean().refine((val) => val === true, "আপনাকে অবশ্যই শর্তাবলীতে সম্মতি দিতে হবে।"),
});

export type FormValues = z.infer<typeof formSchema>;
