import { PageWrapper } from "@/components/common/page-wrapper";
import { getMe, getDistricts, getServices } from "@/services/auth.service";
import { PersonalInfoSection } from "./_components/personal-info-section";
import { ProfessionalInfoSection } from "./_components/professional-info-section";
import { ServiceAreasSection } from "./_components/service-areas-section";
import { WhatsAppSection } from "./_components/whatsapp-section";
import { ServicesSection } from "./_components/services-section";

export default async function Page() {
  const meResult = await getMe();
  const user = meResult.success ? meResult.data.user : null;
  const profile = user?.surveyorProfile ?? null;

  const districtsResult = await getDistricts();
  const districts = districtsResult.success ? districtsResult.data : [];

  const servicesResult = await getServices();
  const services = servicesResult.success ? servicesResult.data : [];

  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <PersonalInfoSection user={user} />
        <ProfessionalInfoSection profile={profile} />
        <ServiceAreasSection profile={profile} districts={districts} />
        <WhatsAppSection user={user} />
        <ServicesSection profile={profile} services={services} />
      </div>
    </PageWrapper>
  );
}
