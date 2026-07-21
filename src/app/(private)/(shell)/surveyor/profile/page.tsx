import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import { SurveyorProfileForm } from "@/components/surveyor/profile/surveyor-profile-form";

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <SurveyorProfileForm />
    </PageWrapper>
  );
}
