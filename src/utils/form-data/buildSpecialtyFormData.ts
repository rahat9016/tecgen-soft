import { ISpecialtySubmitPayload } from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/types";

const appendToFormData = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendToFormData(formData, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(
      ([childKey, childValue]) => {
        appendToFormData(formData, `${key}[${childKey}]`, childValue);
      }
    );
    return;
  }

  formData.append(key, String(value));
};

export const buildSpecialtyFormData = (payload: ISpecialtySubmitPayload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    appendToFormData(formData, key, value);
  });

  return formData;
};

export type BuildSpecialtyFormDataFn = typeof buildSpecialtyFormData;
