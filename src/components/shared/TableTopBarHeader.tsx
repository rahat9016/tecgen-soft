import DynamicBreadcrumb from "./DynamicBreadcrumb";

interface TableHeaderProps {
  title?: string;
}

export default function TableTopBarHeader({ title }: TableHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row w-full lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl text-secondary-dark font-semibold mb-2">
              {title}
            </h1>
            <DynamicBreadcrumb />
          </div>
        </div>
      </div>
    </div>
  );
}
