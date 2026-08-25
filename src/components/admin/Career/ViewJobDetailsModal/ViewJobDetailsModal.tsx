import Paragraph from "@/src/components/shared/Paragraph";
import StatusBadge from "@/src/components/shared/Status/Status";
import Text from "@/src/components/shared/Text";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { StatusType } from "@/src/types/common/common";
import { formatDate } from "@/src/utils/formatDate";
import { SquarePen, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICareer } from "../types";

export default function ViewJobDetailsModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: ICareer;
}) {
  const router = useRouter();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[60vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Job Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-6 p-6 bg-light rounded-xl">
          <div className="w-47.25 h-38.75 rounded overflow-hidden">
            {data?.image ? (
              <Image
                src={data.image}
                alt={data.title}
                width={500}
                height={450}
                className="w-full h-full object-cover "
              />
            ) : (
              <User className="w-full h-full p-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-start gap-6">
              <Text className="lg:text-xl xl:text-2xl text-secondary-foreground">
                {data?.title}
              </Text>
              <StatusBadge
                status={
                  data?.isActive ? StatusType.ACTIVE : StatusType.INACTIVE
                }
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-3 mt-6">
              <Paragraph className="text-[#8A8A8A] font-medium">
                Job Location:{" "}
                <span className="font-normal">{data?.location}</span>
              </Paragraph>
              <Paragraph className="text-[#8A8A8A] font-medium">
                Employment Status:{" "}
                <span className="font-normal">{data?.location}</span>
              </Paragraph>
              <Paragraph className="text-[#8A8A8A] font-medium">
                Experience:{" "}
                <span className="font-normal">{data?.experience}</span>
              </Paragraph>
              <Paragraph className="text-[#8A8A8A] font-medium">
                Vacancy: <span className="font-normal">{data?.vacancy}</span>
              </Paragraph>
              <Paragraph className="text-[#8A8A8A] font-medium">
                Salary Range:{" "}
                <span className="font-normal">
                  {data?.salary} {data?.currency}
                </span>
              </Paragraph>
              <Paragraph className="text-[#8A8A8A] font-medium">
                Deadline:{" "}
                <span className="font-normal">
                  {data?.deadline ? formatDate(data.deadline) : "N/A"}
                </span>
              </Paragraph>
            </div>
          </div>
        </div>

        {data && (
          <div
            className="my-6"
            dangerouslySetInnerHTML={{ __html: data?.description }}
          />
        )}
        <Button
          onClick={() => router.push(`/admin/update-career/${data?.id}`)}
          className="w-40 lg:w-49.75 h-11 text-sm  md:text-base font-medium"
        >
          <SquarePen />
          Update Details
        </Button>
      </DialogContent>
    </Dialog>
  );
}
