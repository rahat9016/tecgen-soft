"use client";

import { ICareer } from "@/src/components/admin/Career/types";
import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { parseSalaryValue } from "@/src/utils/parseFormValue";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { careerSchema, CareerSchemaForm } from "../Schema/careerSchema";
import { JobType } from "../types";
import CareerForm from "./CareerForm";
import { StatusType } from "@/src/types/common/common";

export default function CreateUpdateCareer({
  initialValues,
}: {
  initialValues?: ICareer | undefined;
}) {
  const router = useRouter();
  const {
    mutate: createCareer,
    isPending: isCreating,
    error,
  } = usePost<ICareer>(
    "/career",
    () => {
      toast.success("Career created successfully!");
      router.push("/admin/job-list");
    },
    [["careers"]]
  );

  const { mutate: updateCareer, isPending: isUpdating } =
    usePatch<ICareer>(() => {
      toast.success("Career updated successfully!");
      router.push("/admin/job-list");
    }, [["careers"]]);
  const methods = useForm({
    resolver: yupResolver(careerSchema),
    values: {
      image: initialValues?.image || "",
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status as StatusType,
      vacancy: Number(initialValues?.vacancy) || 1,
      location: initialValues?.location || "",
      salary: parseSalaryValue(initialValues?.salary),
      deadline: initialValues?.deadline || "",
      experience: String(initialValues?.experience || ""),
      jobType: initialValues?.jobType as JobType,
    },
  });

  const onSubmit = (data: CareerSchemaForm) => {
    try {
      const formData = new FormData();

      const deadlineDate = new Date(data.deadline);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("vacancy", String(data.vacancy));
      formData.append("location", data.location);
      formData.append("deadline", deadlineDate.toISOString());
      formData.append("status", data.status);
      formData.append("experience", data.experience);
      formData.append("jobType", data.jobType);
      formData.append("salary", String(data.salary));
      formData.append("currency", String("BDT"));

      // Append image if it's a File object
      if (data.image instanceof File) {
        formData.append("image", data.image);
      } else if (typeof data.image === "string" && data.image) {
        formData.append("image", data.image);
      }

      if (initialValues) {
        // PATCH request
        updateCareer({
          url: `/career/${initialValues.id}`,
          data: formData,
        });
      } else {
        // POST request
        createCareer({
          data: formData,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <FormProvider {...methods}>
      <CareerForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={error}
        isPending={isCreating || isUpdating}
      />
    </FormProvider>
  );
}
