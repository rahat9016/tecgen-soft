"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SpecialtyDataTable } from "../SpecialtyTable/specialty-data-table";
import { ISelectedDoctor, ISpecialtyFormType, StatusValue } from "../types";

import { toast } from "react-toastify";
import { GetDoctorSectionColumns } from "../SpecialtyColumns/DoctorSectionColumns";
import DoctorSelectionModal from "./DoctorSelectionModal";
import Section from "./Section";

export default function DoctorSectionFields() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ISpecialtyFormType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedDoctors =
    (watch("doctorSection.doctors") as ISelectedDoctor[]) || [];

  const handleAddDoctors = (doctors: ISelectedDoctor[]) => {
    const normalizedDoctors = doctors.map((doctor) => ({
      ...doctor,
      status: doctor.status || "ACTIVE",
    }));

    setValue("doctorSection.doctors", normalizedDoctors, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setIsModalOpen(false);
    toast.success("Doctor added successfully", {
      position: "bottom-left",
    });
  };

  const handleRemoveDoctor = (doctorId: string) => {
    const updated = selectedDoctors.filter((d) => d.id !== doctorId);
    setValue("doctorSection.doctors", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success("Doctor removed successfully", {
      position: "bottom-left",
    });
  };

  const handleDoctorStatusChange = (doctorId: string, status: StatusValue) => {
    const updated = selectedDoctors.map((doctor) =>
      doctor.id === doctorId ? { ...doctor, status } : doctor
    );

    setValue("doctorSection.doctors", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });

    toast.success("Doctor status updated", {
      position: "bottom-left",
    });
  };

  const columns = GetDoctorSectionColumns(
    handleRemoveDoctor,
    handleDoctorStatusChange
  );
  const doctorErrorMessage =
    (errors.doctorSection?.doctors as { message?: string } | undefined)
      ?.message || "";

  return (
    <Section
      name="doctorSection"
      sectionTitle="Section 01"
      toggleName="doctorSection.isActive"
      inputLabel="Section Title"
      inputPlaceholder="Enter doctor section title"
    >
      <SpecialtyDataTable
        columns={columns}
        data={selectedDoctors}
        isLoading={false}
        itemsPerPage={5}
        setIsModalOpen={(isOpen) => {
          if (isOpen) {
            setIsModalOpen(true);
          }
        }}
        createTitle="Add Doctor"
      />

      {doctorErrorMessage ? (
        <p className="text-sm text-red-500">{doctorErrorMessage}</p>
      ) : null}

      {/* Doctor Selection Modal */}
      <DoctorSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDoctors}
        selectedDoctors={selectedDoctors}
      />
    </Section>
  );
}
