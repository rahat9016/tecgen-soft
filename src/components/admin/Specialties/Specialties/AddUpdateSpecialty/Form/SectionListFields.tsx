import { useFormContext } from "react-hook-form";
import {
  ColumnDef,
  SpecialtyDataTable,
} from "../SpecialtyTable/specialty-data-table";
import { ISectionItem } from "../types";
import Section from "./Section";

interface SectionListFieldsProps {
  sectionName: string;
  sectionTitle: string;
  columns: ColumnDef<ISectionItem>[];
  data: ISectionItem[];
  onOpenCreateModal: () => void;
  children?: React.ReactNode;
}

export default function SectionListFields({
  sectionName,
  sectionTitle,
  columns,
  data,
  onOpenCreateModal,
  children,
}: SectionListFieldsProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const getErrorFromPath = (
    nestedErrors: unknown,
    path: string
  ): string | undefined => {
    const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let current: unknown = nestedErrors;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return (current as { message?: string } | undefined)?.message;
  };

  const listErrorMessage = getErrorFromPath(errors, `${sectionName}.items`);

  return (
    <Section
      name={sectionName}
      sectionTitle={sectionTitle}
      inputLabel="Section Title"
      inputPlaceholder="Enter section title"
    >
      {children}
      <SpecialtyDataTable
        columns={columns}
        data={data}
        isLoading={false}
        itemsPerPage={4}
        setIsModalOpen={(isOpen) => {
          if (isOpen) {
            onOpenCreateModal();
          }
        }}
        createTitle="Add List Item"
      />
      {listErrorMessage && (
        <p className="text-rose-500 text-xs mt-2">{listErrorMessage}</p>
      )}
    </Section>
  );
}
