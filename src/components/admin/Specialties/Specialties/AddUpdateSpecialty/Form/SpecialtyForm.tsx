"use client";

import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import CreateUpdateSpecialtySection from "../CreateUpdateSpecialtySection";
import { GetSectionThreeColumns } from "../SpecialtyColumns/SectionThreeColumns";
import {
  ISectionItem,
  ISpecialtyFormType,
  ISpecialtySubmitPayload,
  SectionType,
} from "../types";
import DoctorSectionFields from "./DoctorSelectionFields";
import { FileSpecialtyUploadController } from "./FileSpecialtyUploadController";
import SectionEightFields from "./SectionEightFields";
import SectionFiveFields from "./SectionFiveFields";
import SectionListFields from "./SectionListFields";
import SectionOneFields from "./SectionOneFields";
import SectionSevenFields from "./SectionSevenFields";
import SectionThreeFields from "./SectionThreeFields";
import SectionTwoFields from "./SectionTwoFields";

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

type ListSectionKey =
  | "sectionThree"
  | "sectionFour"
  | "sectionSix"
  | "sectionSeven";

export default function SpecialtyForm({
  onSubmit,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: ISpecialtySubmitPayload) => void;
  isPending?: boolean;
}) {
  const [isCreateUpdateSpecialtyOpen, setIsCreateUpdateSpecialtyOpen] =
    useState(false);
  const [activeListSection, setActiveListSection] =
    useState<ListSectionKey>("sectionThree");
  const [editingItem, setEditingItem] = useState<ISectionItem | undefined>();
  const [sectionThreeItems, setSectionThreeItems] = useState<ISectionItem[]>(
    []
  );
  const [sectionFourItems, setSectionFourItems] = useState<ISectionItem[]>([]);
  const [sectionSixItems, setSectionSixItems] = useState<ISectionItem[]>([]);
  const [sectionSevenItems, setSectionSevenItems] = useState<ISectionItem[]>(
    []
  );
  const hasInitializedListState = useRef(false);

  const { handleSubmit, control, setValue } =
    useFormContext<ISpecialtyFormType>();

  const watchedValues = useWatch({ control }) as ISpecialtyFormType;

  useEffect(() => {
    setValue("sections.sectionThree.items", sectionThreeItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [sectionThreeItems, setValue]);

  useEffect(() => {
    setValue("sections.sectionFour.items", sectionFourItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [sectionFourItems, setValue]);

  useEffect(() => {
    setValue("sections.sectionSix.items", sectionSixItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [sectionSixItems, setValue]);

  useEffect(() => {
    setValue("sections.sectionSeven.items", sectionSevenItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [sectionSevenItems, setValue]);

  useEffect(() => {
    if (!watchedValues?.sections || hasInitializedListState.current) return;

    setSectionThreeItems(watchedValues.sections.sectionThree?.items || []);
    setSectionFourItems(watchedValues.sections.sectionFour?.items || []);
    setSectionSixItems(watchedValues.sections.sectionSix?.items || []);
    setSectionSevenItems(watchedValues.sections.sectionSeven?.items || []);
    hasInitializedListState.current = true;
  }, [watchedValues?.sections]);

  const sectionThreeColumns = GetSectionThreeColumns(
    (item) => handleEditItem("sectionThree", item),
    (item) => handleDeleteItem("sectionThree", item)
  );
  const sectionFourColumns = GetSectionThreeColumns(
    (item) => handleEditItem("sectionFour", item),
    (item) => handleDeleteItem("sectionFour", item)
  );
  const sectionSixColumns = GetSectionThreeColumns(
    (item) => handleEditItem("sectionSix", item),
    (item) => handleDeleteItem("sectionSix", item)
  );
  const sectionSevenColumns = GetSectionThreeColumns(
    (item) => handleEditItem("sectionSeven", item),
    (item) => handleDeleteItem("sectionSeven", item)
  );

  function openCreateModal(sectionKey: ListSectionKey) {
    setActiveListSection(sectionKey);
    setEditingItem(undefined);
    setIsCreateUpdateSpecialtyOpen(true);
  }

  function handleEditItem(sectionKey: ListSectionKey, item: ISectionItem) {
    setActiveListSection(sectionKey);
    setEditingItem(item);
    setIsCreateUpdateSpecialtyOpen(true);
  }

  function handleDeleteItem(sectionKey: ListSectionKey, item: ISectionItem) {
    if (!item.id) return;

    updateItemsBySection(sectionKey, (prev) =>
      prev.filter((current) => current.id !== item.id)
    );

    if (editingItem?.id === item.id) {
      setEditingItem(undefined);
    }

    toast.success("Item removed successfully", {
      position: "bottom-left",
    });
  }

  function updateItemsBySection(
    sectionKey: ListSectionKey,
    updater: (prev: ISectionItem[]) => ISectionItem[]
  ) {
    if (sectionKey === "sectionThree") {
      setSectionThreeItems(updater);
      return;
    }

    if (sectionKey === "sectionFour") {
      setSectionFourItems(updater);
      return;
    }

    if (sectionKey === "sectionSix") {
      setSectionSixItems(updater);
      return;
    }

    setSectionSevenItems(updater);
  }

  function handleSaveItem(item: ISectionItem) {
    const isEditing = Boolean(editingItem?.id);

    updateItemsBySection(activeListSection, (prev) => {
      if (editingItem?.id) {
        return prev.map((current) =>
          current.id === editingItem.id
            ? { ...current, ...item, id: editingItem.id }
            : current
        );
      }

      return [
        ...prev,
        {
          ...item,
          id: item.id || `${Date.now()}`,
        },
      ];
    });

    setEditingItem(undefined);
    toast.success(
      isEditing ? "Item updated successfully" : "Item added successfully",
      {
        position: "bottom-left",
      }
    );
  }

  const onFormSubmit = (data: ISpecialtyFormType) => {
    const toNumber = (value: number | string | null | undefined) => {
      const parsedValue = Number(value);

      return Number.isFinite(parsedValue) ? parsedValue : 0;
    };

    const normalizedSectionTwoImages = data.sections.sectionTwo.images.map(
      (item) => {
        const normalizedPosition = toNumber(item.position);

        if (normalizedPosition === 0) {
          return {
            position: normalizedPosition,
            imageUrl:
              data.sections.sectionTwo.coverImage ?? item.imageUrl ?? null,
          };
        }

        return {
          imageUrl: item.imageUrl ?? null,
          position: normalizedPosition,
        };
      }
    );

    const sanitizeSectionItems = (items: ISectionItem[] = []) =>
      items.map((item) => ({
        title: item.title,
        description: item.description,
        status: item.status,
      }));

    const submitPayload: ISpecialtySubmitPayload = {
      hero: {
        title: data.hero.title,
        description: data.hero.description,
        coverImage: data.hero.coverImage,
        status: data.hero.status,
      },
      doctorSection: {
        title: data.doctorSection.title,
        order: toNumber(data.doctorSection.order),
        status: data.doctorSection.isActive ? "ACTIVE" : "INACTIVE",
        doctorIds: (data.doctorSection.doctors || []).map((doctor) => ({
          id: doctor.id,
          doctorId: doctor.doctorId,
          status: doctor.status || "ACTIVE",
        })),
      },
      sections: [
        {
          title: data.sections.sectionOne.title,
          description: data.sections.sectionOne.description,
          order: toNumber(data.sections.sectionOne.order),
          status: data.sections.sectionOne.isActive ? "ACTIVE" : "INACTIVE",
          type: SectionType.TEXT,
        },
        {
          title: data.sections.sectionTwo.title,
          description: data.sections.sectionTwo.description,
          images: normalizedSectionTwoImages,
          order: toNumber(data.sections.sectionTwo.order),
          status: data.sections.sectionTwo.isActive ? "ACTIVE" : "INACTIVE",
          type: SectionType.TEXT_WITH_IMAGE,
        },
        {
          title: data.sections.sectionThree.title,
          order: toNumber(data.sections.sectionThree.order),
          status: data.sections.sectionThree.isActive ? "ACTIVE" : "INACTIVE",
          items: sanitizeSectionItems(
            data.sections.sectionThree.items ?? sectionThreeItems
          ),
          type: SectionType.LIST,
        },
        {
          title: data.sections.sectionFour.title,
          order: toNumber(data.sections.sectionFour.order),
          status: data.sections.sectionFour.isActive ? "ACTIVE" : "INACTIVE",
          items: sanitizeSectionItems(
            data.sections.sectionFour.items ?? sectionFourItems
          ),
          type: SectionType.LIST,
        },
        {
          title: data.sections.sectionFive.title,
          description: data.sections.sectionFive.description,
          order: toNumber(data.sections.sectionFive.order),
          status: data.sections.sectionFive.isActive ? "ACTIVE" : "INACTIVE",
          type: SectionType.TEXT,
        },
        {
          title: data.sections.sectionSix.title,
          order: toNumber(data.sections.sectionSix.order),
          status: data.sections.sectionSix.isActive ? "ACTIVE" : "INACTIVE",
          items: sanitizeSectionItems(
            data.sections.sectionSix.items ?? sectionSixItems
          ),
          type: SectionType.LIST,
        },
        {
          title: data.sections.sectionSeven.title,
          description: data.sections.sectionSeven.description,
          order: toNumber(data.sections.sectionSeven.order),
          status: data.sections.sectionSeven.isActive ? "ACTIVE" : "INACTIVE",
          items: sanitizeSectionItems(
            data.sections.sectionSeven.items ?? sectionSevenItems
          ),
          type: SectionType.TEXT_WITH_LIST,
        },
        {
          title: data.sections.sectionEight.title,
          description: data.sections.sectionEight.description,
          order: toNumber(data.sections.sectionEight.order),
          status: data.sections.sectionEight.isActive ? "ACTIVE" : "INACTIVE",
          type: SectionType.TEXT,
        },
      ],
    };
    onSubmit(submitPayload);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onFormSubmit)} className="w-full space-y-8">
        <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
                <Image
                  src="/icons/group.svg"
                  alt="basic information"
                  width={36}
                  height={36}
                  className="w-4"
                />
              </div>
              <Paragraph className="xl:text-lg font-medium">
                Hero Management
              </Paragraph>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <InputLabel label="Title" required />
              <ControlledInputField
                name="hero.title"
                placeholder="Enter hero title"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <InputLabel label="Status" required />
              <ControlledSelectField
                name="hero.status"
                placeholder="Select status"
                options={statusOptions}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div className="col-span-2">
              <InputLabel label="Description" required />
              <ControlledTextareaField
                name="hero.description"
                placeholder="Enter description"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div className="col-span-2 mt-4">
              <FileSpecialtyUploadController
                name="hero.coverImage"
                label="Upload hero image"
                className="border-light-silver text-secondary-foreground bg-light"
              />
            </div>
          </div>
        </div>
        <DoctorSectionFields />
        <SectionOneFields />
        <SectionTwoFields />
        <SectionThreeFields
          columns={sectionThreeColumns}
          data={sectionThreeItems}
          onOpenCreateModal={() => openCreateModal("sectionThree")}
        />
        <SectionListFields
          sectionName="sections.sectionFour"
          sectionTitle="Section 05"
          columns={sectionFourColumns}
          data={sectionFourItems}
          onOpenCreateModal={() => openCreateModal("sectionFour")}
        />
        <SectionFiveFields />
        <SectionListFields
          sectionName="sections.sectionSix"
          sectionTitle="Section 07"
          columns={sectionSixColumns}
          data={sectionSixItems}
          onOpenCreateModal={() => openCreateModal("sectionSix")}
        />
        <SectionSevenFields
          columns={sectionSevenColumns}
          data={sectionSevenItems}
          onOpenCreateModal={() => openCreateModal("sectionSeven")}
        />
        <SectionEightFields />
        <div className="flex items-center justify-end gap-4">
          <SubmitButton isLoading={isPending} label="Save Changes" />
        </div>
      </form>

      <CreateUpdateSpecialtySection
        isOpen={isCreateUpdateSpecialtyOpen}
        onClose={() => {
          setEditingItem(undefined);
          setIsCreateUpdateSpecialtyOpen(false);
        }}
        initialValues={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
}
