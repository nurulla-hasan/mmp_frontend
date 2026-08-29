import { PageWrapper } from "@/components/common/page-wrapper";
import { getMe, getDistricts, getServices } from "@/services/auth.service";
import { ProfileHeroHeader } from "./_components/profile-hero-header";
import { PersonalInfoSection } from "./_components/personal-info-section";
import { ProfessionalInfoSection } from "./_components/professional-info-section";
import { ServiceAreasSection } from "./_components/service-areas-section";
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
        {/* Top Hero Banner */}
        <ProfileHeroHeader user={user} profile={profile} districts={districts} />

        {/* 2-Column Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Personal & Contact Details */}
          <div className="space-y-6 lg:col-span-4">
            <PersonalInfoSection user={user} districts={districts} />
          </div>

          {/* Right Column: Professional Info, Service Areas & Services */}
          <div className="space-y-6 lg:col-span-8">
            <ProfessionalInfoSection profile={profile} />
            <ServiceAreasSection profile={profile} districts={districts} />
            <ServicesSection profile={profile} services={services} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
