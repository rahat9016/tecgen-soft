"use client";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { useEffect, useState } from "react";
import { IDepartment } from "../types";
import AddDepartmentModal from "./AddDepartmentModal/AddDepartmentModal";
import { getDepartmentColumns } from "./DepartmentsColumns/DepartmentsColumns";
import ViewDepartmentModal from "./ViewDepartmentModal/ViewDepartmentModal";

export default function DepartmentList() {
  const [openView, setOpenView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<
    IDepartment | undefined
  >();
  const [editingDepartment, setEditingDepartment] = useState<
    IDepartment | undefined
  >();
  const {
    setCurrentPage,
    itemsPerPage,
    currentPage,
    totalItems,
    setTotalItems,
    setItemsPerPage,
  } = usePagination();
  const { search, handleSearchChange, debouncedSearch } =
    useSearchDebounce(300);
  const { sortBy } = useAppSelector((state) => state.filter);

  const handleView = (department: IDepartment) => {
    setSelectedDepartment(department);
    setOpenView(true);
  };

  const handleModalState = (open: boolean) => {
    if (open) {
      setEditingDepartment(undefined);
    }
    setIsModalOpen(open);
  };

  const handleEdit = () => {
    if (!selectedDepartment) return;
    setEditingDepartment(selectedDepartment);
    setOpenView(false);
    setIsModalOpen(true);
  };

  const handleEditFromRow = (department: IDepartment) => {
    setEditingDepartment(department);
    setOpenView(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(undefined);
  };

  const { data, isLoading } = useGet<IDepartment[]>(
    "/department",
    [
      "departments",
      currentPage.toString(),
      itemsPerPage.toString(),
      debouncedSearch,
      sortBy,
    ],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
      search: debouncedSearch,
      ...(sortBy && { status: sortBy }),
    }
  );
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = getDepartmentColumns(handleView, handleEditFromRow);

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        title="Departments"
        searchValue={search}
        onSearchChange={handleSearchChange}
        tabs={[
          { name: "Doctors", route: "/admin/doctors" },
          { name: "Departments", route: "/admin/departments" },
        ]}
        IsCreate
        setIsModalOpen={handleModalState}
      />
      <ViewDepartmentModal
        isOpen={openView}
        onClose={() => setOpenView(false)}
        data={selectedDepartment}
        onEdit={handleEdit}
      />

      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialValues={editingDepartment}
      />
    </div>
  );
}
