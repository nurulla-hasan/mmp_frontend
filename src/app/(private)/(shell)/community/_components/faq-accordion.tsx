import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { communityFaqs } from "../_data";

export function FaqAccordion() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <Accordion>
            {communityFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`community-faq-${i}`}>
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
  );
}
