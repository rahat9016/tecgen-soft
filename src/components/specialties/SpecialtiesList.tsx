import NotFoundData from "../shared/NotFoundData";
import SpecialtiesCard from "./SpecialtiesCard";
import SpecialtiesSkeleton from "./SpecialtiesSkeleton";
import { ISpecialtyListItem } from "./types";

interface ISpecialtiesListProps {
  data: ISpecialtyListItem[];
  isLoading: boolean;
}

export default function SpecialtiesList({
  data,
  isLoading,
}: ISpecialtiesListProps) {
  if (isLoading) {
    return <SpecialtiesSkeleton />;
  }

  if (!data?.length) {
    return <NotFoundData />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
      {data?.map((specialty) => (
        <SpecialtiesCard key={specialty.id} {...specialty} />
      ))}
    </div>
  );
}
