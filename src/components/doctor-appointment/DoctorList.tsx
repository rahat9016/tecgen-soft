"use client";

import { IDepartment } from "@/src/components/admin/Departments/types";
import { useGet } from "@/src/hooks/useGet";
import { DEFAULT_BOOKING_TYPE } from "@/src/lib/redux/features/filter/filterSlice";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { buildQueryParams } from "@/src/utils/buildQueryParams";
import { mapToSelectOptions } from "@/src/utils/mapToSelectOptions";
import { AnimatePresence, motion } from "framer-motion";
import { IDoctor } from "../admin/Doctors/types";
import NotFoundData from "../shared/NotFoundData";
import SocialMedia from "../shared/SocialMedia/SocialMedia";
import Text from "../shared/Text";
import DoctorCard from "./DoctorCard";
import DoctorCardSkeleton from "./DoctorCardSkeleton";
import { DoctorFilter } from "./DoctorFilter";

export default function DoctorList() {
  const filters = useAppSelector((state) => state.filter);

  const queryString = buildQueryParams({
    ...filters,
    bookingType: filters.bookingType || DEFAULT_BOOKING_TYPE,
  });

  const { data: departmentData } = useGet<IDepartment[]>(`/department/list`, [
    "departments",
  ]);
  const { data: doctorList } = useGet<IDoctor[]>(`/doctor/doctor-list`, [
    "doctor-list",
  ]);
  const { data, isLoading } = useGet<IDoctor[]>(
    `/doctor?${queryString}&&status=ACTIVE`,
    [
      "doctors",
      filters.bookingType,
      filters.selectDepartment?.toString(),
      filters.doctorId?.toString(),
    ]
  );
  const departmentOptions = mapToSelectOptions(
    departmentData?.data,
    "name",
    "id"
  );
  const doctorListOptions = mapToSelectOptions(
    doctorList?.data,
    "fullName",
    "doctorId"
  );
  return (
    <div>
      <SocialMedia />
      <Text className="xl:mb-10 text-xl md:text-2xl lg:text-3xl xl:text-[32px] mb-8">
        Search Doctors
      </Text>
      <DoctorFilter
        departmentOptions={departmentOptions}
        doctors={doctorListOptions}
      />
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 pb-10 lg:mb-25"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <DoctorCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : !data?.data || data?.data.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mb-10">
                <NotFoundData />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={queryString || "results"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 pb-10 lg:mb-25"
            >
              <AnimatePresence>
                {data?.data.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <DoctorCard {...doctor} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
