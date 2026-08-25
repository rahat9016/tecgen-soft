import { IHealthCheckPackage } from "@/src/components/health-check/types";
import Paragraph from "@/src/components/shared/Paragraph";
import Text from "@/src/components/shared/Text";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { SquarePen, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ViewHealthPackageModal({
  isOpen,
  onClose,
  doctor: healthPk,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor?: IHealthCheckPackage;
}) {
  const router = useRouter();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[50vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Package Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="w-13.5 h-13.5 rounded overflow-hidden">
            {healthPk?.image ? (
              <Image
                src={healthPk.image}
                alt={healthPk.title}
                width={220}
                height={142}
                className="w-full h-full object-cover "
              />
            ) : (
              <User className="w-full h-full p-5 text-gray-400" />
            )}
          </div>
          <div>
            <Text className="lg:text-lg xl:text-lg">{healthPk?.title}</Text>
            <Paragraph className="text-primary font-medium">
              {healthPk?.price} BDT
            </Paragraph>
          </div>
        </div>

        <div className="mt-6">
          <Paragraph>What you Get:</Paragraph>
          <div className="border border-light-silver p-5 rounded-2xl bg-light mt-4">
            <ul className="list-disc pl-5 space-y-1  grid grid-cols-1 md:grid-cols-2 ">
              {healthPk?.serviceList.map((item, index) => (
                <li
                  key={index}
                  className="text-sm md:text-base text-secondary-gary font-normal"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(`/admin/health-package-update/${healthPk?.id}`)
          }
          className="w-40 lg:w-49.75 h-11 text-sm  md:text-base font-medium"
        >
          <SquarePen />
          Update Details
        </Button>
      </DialogContent>
    </Dialog>
  );
}
