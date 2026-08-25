import { GeneralMembershipSchemaForm } from "@/src/components/admin/Membership/Schema/generalMembershipSchema";
import { Gender, StatusType } from "@/src/types/common/common";

export const getDefaultValues = (): GeneralMembershipSchemaForm => ({
  name: "",
  gender: Gender.MALE,
  dateOfBirth: "",
  contactNumber: "",
  email: "",
  nationalId: "",
  bloodGroup: "",
  address: "",
  discount: undefined,
  status: StatusType.PENDING,
  emergency: {
    name: "",
    phone: "",
    relation: undefined,
  },
});

export const cleanGeneralMembershipPayload = (
  data: GeneralMembershipSchemaForm
) => {
  const emergency = data.emergency;
  const hasEmergencyValue = Boolean(
    emergency?.name || emergency?.phone || emergency?.relation
  );

  return {
    ...data,
    dateOfBirth: data.dateOfBirth || undefined,
    nationalId: data.nationalId || undefined,
    bloodGroup: data.bloodGroup || undefined,
    address: data.address || undefined,
    discount: data.discount ?? undefined,
    status: StatusType.PENDING,
    emergency: hasEmergencyValue
      ? {
          name: emergency?.name || undefined,
          phone: emergency?.phone || undefined,
          relation: emergency?.relation || undefined,
        }
      : undefined,
  };
};
