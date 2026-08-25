import { StatusType } from "@/src/types/common/common";
import { CorporateMembershipSchemaForm } from "../Schema/corporateMembershipSchema";
import { ICorporateMembership } from "../types";

type EmployeeStatus =
  | StatusType.ACTIVE
  | StatusType.INACTIVE
  | StatusType.PENDING
  | StatusType.REJECTED;

const normalizeStatus = (status: unknown): EmployeeStatus => {
  const normalized = String(status).toUpperCase();

  if (normalized === StatusType.INACTIVE) return StatusType.INACTIVE;
  if (normalized === StatusType.PENDING) return StatusType.PENDING;
  if (normalized === StatusType.REJECTED) return StatusType.REJECTED;

  return StatusType.ACTIVE;
};

const DEFAULT_VALUES: CorporateMembershipSchemaForm = {
  companyName: "",
  contactPerson: "",
  contactNumber: "",
  totalEmployees: 0,
  industryType: "",
  contactPersonDesignation: "",
  address: "",
  email: "",
  tradeLicense: "",
  discount: 0,
  status: StatusType.ACTIVE,
  packageId: "",
  employees: [],
};

export const getCorporateMembershipValues = (
  initialValues?: ICorporateMembership
): CorporateMembershipSchemaForm => {
  if (!initialValues) {
    return DEFAULT_VALUES;
  }

  return {
    companyName: initialValues.companyName || "",
    contactPerson: initialValues.contactPerson || "",
    contactNumber: initialValues.contactNumber || "",
    totalEmployees: initialValues.totalEmployees ?? 0,
    email: initialValues.email || "",
    industryType: initialValues.industryType || "",
    contactPersonDesignation: initialValues.contactPersonDesignation || "",
    address: initialValues.address || "",
    tradeLicense: initialValues.tradeLicense || "",
    discount: initialValues.discount ?? 0,
    status: normalizeStatus(initialValues.status),
    packageId: initialValues.package?.id || "",
    employees: (initialValues.employees || []).map((employee) => ({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      designation: employee.designation || "",
      phone: employee.phone || "",
      email: employee.email || "",
      status: normalizeStatus(employee.status),
    })),
  };
};
