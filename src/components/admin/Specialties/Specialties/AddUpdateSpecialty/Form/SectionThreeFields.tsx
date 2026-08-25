import { ColumnDef } from "../SpecialtyTable/specialty-data-table";
import { ISectionItem } from "../types";
import SectionListFields from "./SectionListFields";

interface SectionThreeFieldsProps {
  columns: ColumnDef<ISectionItem>[];
  data: ISectionItem[];
  onOpenCreateModal: () => void;
}

export default function SectionThreeFields({
  columns,
  data,
  onOpenCreateModal,
}: SectionThreeFieldsProps) {
  return (
    <SectionListFields
      sectionName="sections.sectionThree"
      sectionTitle="Section 04"
      columns={columns}
      data={data}
      onOpenCreateModal={onOpenCreateModal}
    />
  );
}
