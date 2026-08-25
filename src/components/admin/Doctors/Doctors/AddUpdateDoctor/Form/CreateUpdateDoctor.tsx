"use client";
import { usePatch } from "@/src/hooks/usePatch";
import {
  mapBookingTypeToApi,
  mapGenderToApi,
  mapStatusToApi,
} from "@/src/utils/doctorValueMappers";
import { mapToSelectOptions } from "@/src/utils/mapToSelectOptions";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IDepartment, IDoctor } from "../../../types";
import { doctorSchema } from "../Schema";
import { IDoctorFormType } from "../types";
import DoctorForm from "./DoctorForm";
import {
  getDoctorDefaultValues,
  getDoctorInitialFormValues,
} from "./doctorFormInitialization";

export default function CreateUpdateDoctor({
  initialValues,
  departments,
}: {
  initialValues?: IDoctor | null | undefined;
  departments: IDepartment[];
}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const routeDoctorId = (params?.id as string) || "";
  const routeFullName = searchParams.get("fullName") || "";
  const safeInitialValues = initialValues ?? undefined;
  const isEditMode = Boolean(routeDoctorId || safeInitialValues);
  const lockedDoctorId = routeDoctorId || safeInitialValues?.doctorId || "";
  const lockedFullName = routeFullName || safeInitialValues?.fullName || "";
  const isIdentityLocked = Boolean(lockedDoctorId || lockedFullName);

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Doctor updated successfully!");
    router.push("/admin/doctors");
  }, [["doctors"], ["doctor-list"]]);

  const methods = useForm<IDoctorFormType>({
    resolver: yupResolver(doctorSchema, {
      context: { isEditMode },
    }) as Resolver<IDoctorFormType>,
    values: safeInitialValues
      ? getDoctorInitialFormValues(safeInitialValues)
      : getDoctorDefaultValues(),
    mode: "onChange",
  });

  const onSubmit = (data: IDoctorFormType) => {
    const normalizedDoctorId = isIdentityLocked
      ? lockedDoctorId
      : data.doctorId;
    const normalizedFullName = isIdentityLocked
      ? lockedFullName
      : data.fullName;

    if (isEditMode) {
      let hasError = false;

      if (!normalizedDoctorId?.trim()) {
        methods.setError("doctorId", { message: "Doctor ID is required" });
        hasError = true;
      }
      if (!normalizedFullName?.trim()) {
        methods.setError("fullName", { message: "Full Name is required" });
        hasError = true;
      }
      if (!data.department?.trim()) {
        methods.setError("department", { message: "Department is required" });
        hasError = true;
      }

      if (hasError) return;
    }

    const areaOfExpertise = (data.areaExpertise || [])
      .map((item) => item.expertise?.trim())
      .filter(Boolean) as string[];

    const formData = new FormData();
    formData.append("doctorId", normalizedDoctorId);
    formData.append("fullName", normalizedFullName);
    formData.append("departmentId", data.department);

    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string" && data.image.trim()) {
      formData.append("image", data.image);
    }

    if (data.gender) formData.append("gender", mapGenderToApi(data.gender));
    if (data.contactNumber)
      formData.append("contactNumber", data.contactNumber);
    if (data.email) formData.append("email", data.email);
    if (data.bookingType) {
      formData.append("bookingType", mapBookingTypeToApi(data.bookingType));
    }
    if (data.status) formData.append("status", mapStatusToApi(data.status));
    if (data.specialization)
      formData.append("specialization", data.specialization);
    if (data.designation) formData.append("designation", data.designation);

    areaOfExpertise.forEach((item) => {
      formData.append("areaOfExpertise", item);
    });

    const updateDoctorId = routeDoctorId || safeInitialValues?.doctorId;

    if (isEditMode && updateDoctorId) {
      patchMutateAsync({
        url: `/doctor/${updateDoctorId}`,
        data: formData,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update doctor");
      });
      return;
    }
  };

  useEffect(() => {
    const baseValues = safeInitialValues
      ? getDoctorInitialFormValues(safeInitialValues)
      : getDoctorDefaultValues();
    methods.reset({
      ...baseValues,
      doctorId: routeDoctorId || baseValues.doctorId,
      fullName: routeFullName || baseValues.fullName,
      department: baseValues.department,
    });
  }, [safeInitialValues, methods, routeDoctorId, routeFullName]);

  const departmentOptions = mapToSelectOptions(departments, "name", "id");

  return (
    <div>
      <FormProvider {...methods}>
        <DoctorForm
          isEditMode={isEditMode}
          isIdentityLocked={isIdentityLocked}
          onSubmit={onSubmit}
          departmentOptions={departmentOptions}
          error={patchError}
          isPending={patchIsPending}
        />
      </FormProvider>
    </div>
  );
}
