import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { IDoctorList } from "../../types";
import { ISelectOption } from "../AddUpdateDoctor/types";

export default function AddDoctorModal({
  isOpen,
  onClose,
  doctors,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctors: IDoctorList[];
  isLoading: boolean;
}) {
  const router = useRouter();

  const [selectedDoctor, setSelectedDoctor] = useState<ISelectOption | null>(
    null
  );

  const doctorOptions: ISelectOption[] = useMemo(() => {
    return doctors.map((doctor) => {
      return {
        value: doctor.doctorNo,
        label: `${doctor.doctorName}, ID: ${doctor.doctorNo},  ${doctor?.department ? `Dept: ${doctor.department.name}` : ""}`,
      };
    });
  }, [doctors]);

  const handleSubmit = () => {
    if (!selectedDoctor) return;
    const selectedDoctorData = doctors.find(
      (doctor) => doctor.doctorNo === String(selectedDoctor.value)
    );
    const fullName = selectedDoctorData?.doctorName ?? "";

    router.push(
      `/admin/doctors/add-update-doctor/${selectedDoctor.value}?fullName=${encodeURIComponent(fullName)}`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new doctor</DialogTitle>
        </DialogHeader>
        <div className="h-[50vh] relative">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading doctors...</p>
            </div>
          ) : (
            <div className="w-full flex items-center bg-light-silver border border-light-silver rounded-full px-3">
              <Search className="mr-2 text-gray-500" />

              <CreatableSelect
                options={doctorOptions}
                value={selectedDoctor}
                onChange={(option) =>
                  setSelectedDoctor(option as ISelectOption)
                }
                placeholder="Jane Cooper, ID: BK2025091801, Dept: Cardiology"
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    minHeight: "42px",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 999999,
                  }),
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="h-11 px-6" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="h-11 px-6"
            onClick={handleSubmit}
            disabled={!selectedDoctor}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
