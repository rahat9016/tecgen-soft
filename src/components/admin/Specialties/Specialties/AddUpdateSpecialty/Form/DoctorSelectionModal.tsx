"use client";

import { IDoctor } from "@/src/components/admin/Doctors/types";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useGet } from "@/src/hooks/useGet";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { Loader, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ISelectedDoctor } from "../types";
import DoctorSelectionCard from "./DoctorSelectionCard";

const normalizeStatus = (status?: string): "ACTIVE" | "INACTIVE" =>
  status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

interface DoctorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctors: ISelectedDoctor[]) => void;
  selectedDoctors: ISelectedDoctor[];
}

export default function DoctorSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDoctors,
}: DoctorSelectionModalProps) {
  const [localSelected, setLocalSelected] = useState<ISelectedDoctor[]>([]);
  const prevIsOpenRef = useRef(isOpen);
  const { search, debouncedSearch, setSearch, handleSearchChange } =
    useSearchDebounce(300);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setLocalSelected(selectedDoctors);
      setSearch("");
    }
    prevIsOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { data: doctorListResponse, isLoading: isListLoading } = useGet<
    IDoctor[]
  >(
    "/doctor",
    ["doctors", "specialty-modal", "list"],
    {
      limit: 10,
    },
    {
      enabled: isOpen,
    }
  );

  const { data: doctorSearchResponse, isLoading: isSearchLoading } = useGet<
    IDoctor[]
  >(
    "/doctor",
    ["doctors", "specialty-modal", "search", debouncedSearch],
    {
      search: debouncedSearch,
      limit: 10,
    },
    {
      enabled: isOpen && debouncedSearch.trim().length > 0,
    }
  );

  const doctorList = doctorListResponse?.data as unknown as IDoctor[];
  const doctors = useMemo(() => doctorList || [], [doctorList]);
  const searchedDoctorList = doctorSearchResponse?.data as unknown as IDoctor[];
  const searchedDoctors = useMemo(
    () => searchedDoctorList || [],
    [searchedDoctorList]
  );

  const selectedDoctorIds = useMemo(
    () => new Set(localSelected.map((doctor) => doctor.id)),
    [localSelected]
  );

  const displayedDoctors = useMemo(() => {
    if (debouncedSearch.trim().length === 0) {
      return doctors;
    }

    const mergedMap = new Map<string, IDoctor>();

    searchedDoctors.forEach((doctor) => {
      mergedMap.set(doctor.id, doctor);
    });

    localSelected.forEach((doctor) => {
      if (!mergedMap.has(doctor.id)) {
        mergedMap.set(doctor.id, doctor as unknown as IDoctor);
      }
    });

    return Array.from(mergedMap.values());
  }, [debouncedSearch, doctors, searchedDoctors, localSelected]);

  const toggleDoctorSelection = (doctor: IDoctor) => {
    const isSelected = selectedDoctorIds.has(doctor.id);

    if (isSelected) {
      setLocalSelected((prev) =>
        prev.filter((selectedDoctor) => selectedDoctor.id !== doctor.id)
      );
      return;
    }

    setLocalSelected((prev) => [
      ...prev,
      {
        id: doctor.id,
        doctorId: doctor.doctorId,
        fullName: doctor.fullName,
        image: doctor.image,
        status: normalizeStatus(doctor.status),
        department: doctor.department,
      },
    ]);
  };

  const handleSubmit = () => {
    onSubmit(localSelected);
    onClose();
  };

  const handleClose = () => {
    setLocalSelected(selectedDoctors);
    setSearch("");
    onClose();
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      handleClose();
      return;
    }

    setLocalSelected(selectedDoctors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="bg-white w-full min-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary-dark">Add Doctor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="w-full flex items-center bg-light border border-light-dark rounded-full px-3 h-11">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by Name, ID, Dept."
                className="w-full bg-transparent px-2 text-sm outline-none"
              />
              {debouncedSearch.trim().length > 0 && isSearchLoading && (
                <Loader className="w-4 h-4 text-gray-500 animate-spin" />
              )}
            </div>
          </div>

          <div className="min-h-100">
            {(
              debouncedSearch.trim().length > 0
                ? isSearchLoading
                : isListLoading
            ) ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 rounded-lg border border-light-dark bg-light animate-pulse"
                  />
                ))}
              </div>
            ) : displayedDoctors.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedDoctors.map((doctor) => {
                  const isSelected = selectedDoctorIds.has(doctor.id);

                  return (
                    <DoctorSelectionCard
                      key={doctor.id}
                      doctor={doctor}
                      isSelected={isSelected}
                      onToggle={toggleDoctorSelection}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No doctors found.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Selected Doctors</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
