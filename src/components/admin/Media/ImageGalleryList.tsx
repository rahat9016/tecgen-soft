"use client";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { useEffect } from "react";
import MediaTable from "./MediaTable";
import { GetMediaImageColumns } from "./TableColumns/MediaImageColumns";
import { IMediaImage } from "./types";

export default function ImageGalleryList() {
  const {
    setCurrentPage,
    itemsPerPage,
    currentPage,
    totalItems,
    setTotalItems,
    setItemsPerPage,
  } = usePagination();
  const { sortBy } = useAppSelector((state) => state.filter);

  const { data, isLoading } = useGet<IMediaImage[]>(
    "/image-gallery",
    ["image-gallery", currentPage.toString(), itemsPerPage.toString(), sortBy],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
      ...(sortBy && { status: sortBy }),
    }
  );

  // Update total items whenever data changes
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = GetMediaImageColumns();
  return (
    <div>
      <MediaTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        showSearch={false}
        showCreateButton
        createTitle="Add new image"
        routeURL="/admin/add-media-image"
      />
    </div>
  );
}
