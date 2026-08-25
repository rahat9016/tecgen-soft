"use client";

import { StatusType } from "@/src/types/common/common";
import { IGeneralMembership } from "@/src/types/index";
import { formatDate, getAvatarColor } from "@/src/utils/membershipHelpers";
import { Check, Loader, User, X } from "lucide-react";

interface MembershipRequestItemProps {
  member: IGeneralMembership;
  isProcessing: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const MembershipRequestItem = ({
  member,
  isProcessing,
  onAccept,
  onReject,
}: MembershipRequestItemProps) => {
  const avatarColor = getAvatarColor(member.name || member.email);
  const displayGender = member.gender
    ? member.gender.charAt(0).toUpperCase() +
      member.gender.slice(1).toLowerCase()
    : "";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${avatarColor}`}
        >
          <User size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-dark">
            {member.name || member.email}
          </p>
          <p className="text-[11px] text-secondary-gary">
            {displayGender ? `${displayGender}` : ""}{" "}
            {member.bloodGroup ? `${member.bloodGroup}` : ""}{" "}
            {member.createdAt ? formatDate(member.createdAt) : ""}
          </p>
        </div>
      </div>
      <div>
        {member.status === StatusType.PENDING ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAccept(member.id)}
              disabled={isProcessing}
              className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isProcessing ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
            </button>
            <button
              onClick={() => onReject(member.id)}
              disabled={isProcessing}
              className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isProcessing ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <X size={15} />
              )}
            </button>
          </div>
        ) : member.status === StatusType.ACTIVE ? (
          <span className="text-xs font-medium text-green-500">Approved</span>
        ) : (
          <span className="text-xs font-medium text-red-500">Rejected</span>
        )}
      </div>
    </div>
  );
};

export default MembershipRequestItem;
