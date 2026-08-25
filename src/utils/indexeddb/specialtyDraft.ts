import { ISpecialtyFormType } from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/types";
import { openDB } from "idb";

const DB_NAME = "happy-hospital-admin-db";
const DB_VERSION = 1;
const STORE_NAME = "specialty-drafts";

export const DEFAULT_SPECIALTY_DRAFT_ID = "default-specialty-draft";

export interface ISpecialtyDraftRecord {
  id: string;
  payload: ISpecialtyFormType;
  title: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

const getSpecialtyDraftDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

export const upsertSpecialtyDraft = async (
  payload: ISpecialtyFormType,
  draftId: string = DEFAULT_SPECIALTY_DRAFT_ID
): Promise<ISpecialtyDraftRecord> => {
  const db = await getSpecialtyDraftDB();
  const existing = (await db.get(STORE_NAME, draftId)) as
    | ISpecialtyDraftRecord
    | undefined;

  const draft: ISpecialtyDraftRecord = {
    id: draftId,
    payload,
    title: payload.hero?.title || "Untitled Specialty Draft",
    status: payload.hero?.status || "ACTIVE",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, draft);

  return draft;
};

export const getSpecialtyDraft = async (
  draftId: string = DEFAULT_SPECIALTY_DRAFT_ID
): Promise<ISpecialtyDraftRecord | undefined> => {
  const db = await getSpecialtyDraftDB();
  return (await db.get(STORE_NAME, draftId)) as
    | ISpecialtyDraftRecord
    | undefined;
};

export const getAllSpecialtyDrafts = async (): Promise<
  ISpecialtyDraftRecord[]
> => {
  const db = await getSpecialtyDraftDB();
  const drafts = (await db.getAll(STORE_NAME)) as ISpecialtyDraftRecord[];

  return drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const deleteSpecialtyDraft = async (
  draftId: string = DEFAULT_SPECIALTY_DRAFT_ID
): Promise<void> => {
  const db = await getSpecialtyDraftDB();
  await db.delete(STORE_NAME, draftId);
};
