"use client";
import SpecialtyForm from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/Form/SpecialtyForm";
import {
  specialtySchema,
  SpecialtySchemaForm,
} from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/Schema";
import {
  ISpecialtyFormType,
  ISpecialtySubmitPayload,
} from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/types";
import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { buildSpecialtyFormData } from "@/src/utils/form-data/buildSpecialtyFormData";
import {
  DEFAULT_SPECIALTY_DRAFT_ID,
  deleteSpecialtyDraft,
  getSpecialtyDraft,
  upsertSpecialtyDraft,
} from "@/src/utils/indexeddb/specialtyDraft";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { getDefaultValues } from "./getDefaultValues";

export default function CreateUpdateSpecialty({
  initialValues,
  specialtyId,
}: {
  initialValues?: Partial<ISpecialtyFormType> | undefined;
  specialtyId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryDraftId = initialValues ? null : searchParams.get("draftId");
  const isFreshCreateEntry =
    !initialValues && searchParams.get("fresh") === "1";

  const activeDraftId = initialValues
    ? null
    : (queryDraftId ?? DEFAULT_SPECIALTY_DRAFT_ID);

  const { mutate: createSpecialty, isPending: isCreating } = usePost<unknown>(
    "/specialities",
    async () => {
      if (activeDraftId) {
        await deleteSpecialtyDraft(activeDraftId);
      }
      toast.success("Specialty created successfully!");
      router.push("/admin/specialties");
    },
    [["specialities"]]
  );

  const { mutateAsync: updateSpecialty, isPending: isUpdating } =
    usePatch(() => {
      toast.success("Specialty updated successfully!");
      router.push("/admin/specialties");
    }, [["specialities"]]);

  const methods = useForm<SpecialtySchemaForm>({
    resolver: yupResolver(specialtySchema) as Resolver<SpecialtySchemaForm>,
    defaultValues: getDefaultValues(initialValues),
    mode: "onChange",
  });
  const watchedFormValues = useWatch({ control: methods.control });

  useEffect(() => {
    if (!isFreshCreateEntry) return;

    const resetFreshCreateForm = async () => {
      await deleteSpecialtyDraft(DEFAULT_SPECIALTY_DRAFT_ID);
      methods.reset(getDefaultValues());
      router.replace(pathname);
    };

    void resetFreshCreateForm();
  }, [isFreshCreateEntry, methods, pathname, router]);

  useEffect(() => {
    if (initialValues || !activeDraftId || isFreshCreateEntry) return;

    let mounted = true;
    const loadDraft = async () => {
      const draft = await getSpecialtyDraft(activeDraftId);

      if (draft?.payload && mounted) {
        methods.reset(getDefaultValues(draft.payload));
      }
    };
    loadDraft();
    return () => {
      mounted = false;
    };
  }, [activeDraftId, initialValues, isFreshCreateEntry, methods]);

  useEffect(() => {
    if (initialValues || !activeDraftId || isFreshCreateEntry) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void upsertSpecialtyDraft(
        watchedFormValues as ISpecialtyFormType,
        activeDraftId
      );
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [activeDraftId, initialValues, isFreshCreateEntry, watchedFormValues]);

  const onSubmit = (data: ISpecialtySubmitPayload) => {
    if (isCreating || isUpdating) return;

    const formData = buildSpecialtyFormData(data);

    if (initialValues && specialtyId) {
      updateSpecialty({
        url: `/specialities/${specialtyId}`,
        data: formData,
      }).catch((error) => {
        toast.error(error?.message || "Failed to update specialty");
      });
      return;
    }

    createSpecialty(formData);
  };

  const isPending = isCreating || isUpdating;
  return (
    <div>
      <FormProvider {...methods}>
        <SpecialtyForm
          isEditMode={!!initialValues}
          onSubmit={onSubmit}
          // error={error || patchError}
          isPending={isPending}
        />
      </FormProvider>
    </div>
  );
}
