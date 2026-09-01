import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Mouza Map Pro দিয়ে কী করা যাবে?",
    a: "ডিজিটাল পদ্ধতিতে জমির মাপজোখ ও হিসাব সংরক্ষণ করা, মৌজা ম্যাপ এনালাইসিস করা, ভেরিফাইড দক্ষ সার্ভেয়ার খোঁজা এবং তাদের সাথে সরাসরি যোগাযোগ করে সেবা নেওয়া যাবে।",
  },
  {
    q: "ল্যান্ড টুলস কি বিনামূল্যে ব্যবহার করা যাবে?",
    a: "হ্যাঁ, বেসিক ল্যান্ড টুলস সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়। এছাড়া সেভ করা আনলিমিটেড ক্যালকুলেশন, এইচডি এক্সপোর্ট এবং বিশেষ ফিচারগুলোর জন্য প্রো সুবিধা রয়েছে।",
  },
  {
    q: "ক্যালকুলেশন কি পরে আবার খোলা যাবে?",
    a: "হ্যাঁ, লগইন করা ব্যবহারকারী যেকোনো সময় তাদের সেভ করা প্রজেক্ট ড্যাশবোর্ড থেকে খুলে পুনরায় এডিট বা প্রিন্ট করতে পারবেন।",
  },
  {
    q: "সার্ভেয়ার কীভাবে ভেরিফাইড হবে?",
    a: "সার্ভেয়ার আবেদন জমা দিলে আমাদের অ্যাডমিন টিম তাদের পরিচয়পত্র, সার্ভে সনদ ও অভিজ্ঞতা যাচাই করে ভেরিফিকেশন ব্যাজ প্রদান করে।",
  },
  {
    q: "সার্ভেয়ারদের সাথে কীভাবে যোগাযোগ করব?",
    a: "সার্ভেয়ার ডিরেক্টরি থেকে আপনার এলাকার সার্ভেয়ার নির্বাচন করে তাদের প্রোফাইলে থাকা সরাসরি ফোন নম্বর বা WhatsApp বাটনে ক্লিক করে সাথে সাথে যোগাযোগ করতে পারবেন।",
  },
  {
    q: "Mouza Map Pro কি সরকারি প্ল্যাটফর্ম?",
    a: "না। Mouza Map Pro একটি স্বাধীন ডিজিটাল ল্যান্ড টুলস এবং প্রফেশনাল সার্ভেয়ার নেটওয়ার্ক প্ল্যাটফর্ম। সরকারি চূড়ান্ত নথির জন্য সংশ্লিষ্ট সরকারি ভূমি অফিসের তথ্য অনুসরণ করতে হবে।",
  },
];

export function FaqSection() {
  return (
    <SectionWrapper id="faq">
      <div className="mx-auto max-w-2xl">
        <SectionHeading badge="FAQ" title="সচরাচর জিজ্ঞাসা" />
        <Card className="mt-8">
          <CardContent className="pt-6">
            <Accordion>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
