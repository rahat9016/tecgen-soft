"use client";
import BookingTypeFilter from "@/src/components/shared/BookingTypeFilter/BookingTypeFilter";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { StatusType } from "@/src/types/common/common";
import { useEffect, useState } from "react";
import { IDoctor, IDoctorList } from "../types";
import AddDoctorModal from "./AddDoctorModal/AddDoctorModal";
import { GetDoctorColumns } from "./DoctorsColumns/DoctorsColumns";
import ViewDoctorModal from "./ViewDoctorModal/ViewDoctorModal";

export default function DoctorList() {
  const [openView, setOpenView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | undefined>();
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
  const { sortBy, bookingType } = useAppSelector((state) => state.filter);

  const handleView = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setOpenView(true);
  };

  const { data, isLoading } = useGet<IDoctor[]>(
    "/doctor",
    [
      "doctors",
      currentPage.toString(),
      itemsPerPage.toString(),
      debouncedSearch,
      sortBy,
      bookingType,
    ],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
      search: debouncedSearch,
      ...(sortBy && { status: sortBy }),
      ...(bookingType && { bookingType }),
    }
  );
  const { data: doctorListData, isLoading: isDoctorListLoading } = useGet<
    IDoctorList[]
  >("/doctor/list", ["doctor-list"]);

  // Update total items whenever data changes
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const columns = GetDoctorColumns(handleView);

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
        title="Doctors"
        searchValue={search}
        onSearchChange={handleSearchChange}
        tabs={[
          { name: "Doctors", route: "/admin/doctors" },
          { name: "Departments", route: "/admin/departments" },
        ]}
        IsCreate
        setIsModalOpen={setIsModalOpen}
        statusOptions={[
          { label: "All Status", value: "all" },
          { label: "Active", value: StatusType.ACTIVE },
          { label: "On Leave", value: StatusType.ON_LEAVE },
        ]}
        rightComponents={<BookingTypeFilter />}
      />
      <ViewDoctorModal
        isOpen={openView}
        onClose={() => setOpenView(false)}
        doctor={selectedDoctor}
      />

      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        doctors={doctorListData?.data || []}
        isLoading={isDoctorListLoading}
      />
    </div>
  );
}
