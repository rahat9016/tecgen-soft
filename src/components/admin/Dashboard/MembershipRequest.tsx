"use client";

import { useGet } from "@/src/hooks/useGet";
import { usePatch } from "@/src/hooks/usePatch";
import { StatusType } from "@/src/types/common/common";
import { IGeneralMembership } from "@/src/types/index";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MembershipRequestItem from "./MembershipRequestItem";
import MembershipRequestSkeleton from "./Skeleton/MembershipRequestSkeleton";

const MembershipRequest = () => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading } = useGet<IGeneralMembership[]>(
    "/general-membership",
    ["general-membership"],
    { limit: "5", status: StatusType.PENDING }
  );

  const { mutate: updateStatus } = usePatch<IGeneralMembership>(undefined, [
    ["general-membership"],
  ]);

  const memberRequests = data?.data || [];

  const handleAccept = (memberId: string) => {
    if (processingId) return;
    setProcessingId(memberId);
    updateStatus(
      {
        url: `/general-membership/${memberId}`,
        data: { status: StatusType.ACTIVE },
      },
      {
        onSuccess: () => setProcessingId(null),
        onError: () => setProcessingId(null),
      }
    );
  };

  const handleReject = (memberId: string) => {
    if (processingId) return;
    setProcessingId(memberId);
    updateStatus(
      {
        url: `/general-membership/${memberId}`,
        data: { status: StatusType.REJECTED },
      },
      {
        onSuccess: () => setProcessingId(null),
        onError: () => setProcessingId(null),
      }
    );
  };

  if (isLoading) {
    return <MembershipRequestSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[#0C0B18]">
          Membership Request
        </h3>
        <button
          type="button"
          onClick={() => router.push("/admin/general-membership")}
          className="text-sm text-secondary-foreground hover:text-primary font-medium flex items-center gap-0.5 transition-colors"
        >
          View All
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-4">
        {memberRequests.length > 0 ? (
          memberRequests.map((member) => (
            <MembershipRequestItem
              key={member.id}
              member={member}
              isProcessing={processingId === member.id}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        ) : (
          <p className="text-sm text-secondary-gary text-center py-4">
            No pending requests
          </p>
        )}
      </div>
    </div>
  );
};

export default MembershipRequest;
