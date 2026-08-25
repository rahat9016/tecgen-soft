import { Gender, StatusType } from "@/src/types/common/common";
import { GeneralMembershipSchemaForm } from "../Schema/generalMembershipSchema";
import { IGeneralMembership, RelationshipType } from "../types";

const DEFAULT_VALUES: GeneralMembershipSchemaForm = {
  name: "",
  gender: Gender.MALE,
  dateOfBirth: "",
  contactNumber: "",
  email: "",
  nationalId: "",
  bloodGroup: "",
  address: "",
  discount: 0,
  status: StatusType.ACTIVE,
  emergency: {
    name: "",
    phone: "",
    relation: "",
  },
};

export const getDefaultValues = (
  initialValues?: IGeneralMembership
): GeneralMembershipSchemaForm => {
  if (!initialValues) {
    return DEFAULT_VALUES;
  }

  const emergencyRelation = initialValues.emergency?.relation
    ? Object.values(RelationshipType).includes(
        initialValues.emergency.relation as RelationshipType
      )
      ? initialValues.emergency.relation
      : RelationshipType.OTHER
    : undefined;

  return {
    name: initialValues.name || "",
    gender: initialValues.gender as Gender,
    dateOfBirth: initialValues.dateOfBirth
      ? initialValues.dateOfBirth.split("T")[0]
      : "",
    contactNumber: initialValues.contactNumber || "",
    email: initialValues.email || "",
    nationalId: initialValues.nationalId || "",
    bloodGroup: initialValues.bloodGroup || "",
    address: initialValues.address || "",
    discount: initialValues.discount ?? 0,
    status: initialValues.status || StatusType.ACTIVE,
    emergency: initialValues.emergency
      ? {
          name: initialValues.emergency.name || "",
          phone: initialValues.emergency.phone || "",
          relation: emergencyRelation || RelationshipType.OTHER,
        }
      : undefined,
  };
};

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
    status: data.status || undefined,
    emergency: hasEmergencyValue
      ? {
          name: emergency?.name || undefined,
          phone: emergency?.phone || undefined,
          relation: emergency?.relation || undefined,
        }
      : undefined,
  };
};
