import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import CreateUpdateDepartment from "../../Form/CreateUpdateDepartment";
import { IDepartment } from "../../types";

export default function AddDepartmentModal({
  isOpen,
  onClose,
  initialValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: IDepartment;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[40vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            {initialValues ? "Update Department" : "Create New Department"}
          </DialogTitle>
        </DialogHeader>

        <CreateUpdateDepartment
          initialValues={initialValues}
          onCancel={onClose}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
