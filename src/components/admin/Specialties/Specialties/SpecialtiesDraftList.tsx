"use client";

import { DataTable } from "@/src/components/ui/data-table";
import {
  deleteSpecialtyDraft,
  getAllSpecialtyDrafts,
  ISpecialtyDraftRecord,
} from "@/src/utils/indexeddb/specialtyDraft";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GetSpecialtiesDraftColumns } from "./SpecialtiesColumns/SpecialtiesDraftColumns";

export default function SpecialtiesDraftList() {
  const [drafts, setDrafts] = useState<ISpecialtyDraftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const draftData = await getAllSpecialtyDrafts();
      setDrafts(draftData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const columns = GetSpecialtiesDraftColumns({
    onEdit: (draft) => {
      router.push(`/admin/add-speciality?draftId=${draft.id}`);
    },
    onDelete: async (draft) => {
      await deleteSpecialtyDraft(draft.id);
      toast.success("Draft deleted");
      loadDrafts();
    },
  });

  return (
    <DataTable
      columns={columns}
      data={drafts}
      isLoading={isLoading}
      totalItems={drafts.length}
      currentPage={1}
      itemsPerPage={10}
      onPageChange={() => {}}
      setItemsPerPage={() => {}}
      title="Specialty Drafts"
      createTitle="Add New Specialty"
      routeURL="/admin/add-speciality?fresh=1"
      tabs={[
        { name: "specialties", route: "/admin/specialties" },
        { name: "Darft", route: "/admin/specialties-darft" },
      ]}
      showSearch={false}
      isShowStatus={false}
      IsCreate
    />
  );
}
