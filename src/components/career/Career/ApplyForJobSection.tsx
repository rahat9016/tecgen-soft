"use client";

import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { ICareer } from "../../admin/Career/types";
import BlogCardSkeleton from "../../blogs/Blogs/BlogCardSkeleton";
import NotFoundData from "../../shared/NotFoundData";
import Pagination from "../../shared/Pagination";
import Text from "../../shared/Text";
import CareerJobCard from "./CareerJobCard";

export default function ApplyForJobSection() {
  const { itemsPerPage, currentPage, setCurrentPage, setItemsPerPage } =
    usePagination();
  const { debouncedSearch } = useSearchDebounce(300);
  const { sortBy } = useAppSelector((state) => state.filter);

  const { data, isLoading } = useGet<ICareer[]>(
    "/career?status=ACTIVE",
    [
      "careers",
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

  const jobs = data?.data;
  const totalItems = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <section className="pb-10 lg:pb-25">
      <Text as="h2" className="text-3xl mb-6 lg:mb-10">
        Apply for a job
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => <BlogCardSkeleton key={i} />)}

        {!isLoading &&
          jobs &&
          jobs.length > 0 &&
          jobs.map((job) => <CareerJobCard key={job.id} {...job} />)}

        {!isLoading && (!jobs || jobs.length === 0) && <NotFoundData />}
      </div>

      <div className="bg-white border border-light-dark rounded-lg mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </section>
  );
}
