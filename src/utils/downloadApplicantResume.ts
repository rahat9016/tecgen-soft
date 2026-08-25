import { getBaseUrl } from "@/src/config/envConfig";
import { authKey } from "@/src/constants/auth/storageKey";
import { getCookies } from "@/src/utils/local-storage";
import { toast } from "react-toastify";
import { IApplicant } from "../components/admin/Career/types";

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const getResumeUrl = (applicant: IApplicant) => {
  const rawResumeUrl =
    (typeof applicant.resume === "string" && applicant.resume.trim()) ||
    (typeof applicant.resumeUrl === "string" && applicant.resumeUrl.trim()) ||
    "";

  if (rawResumeUrl) {
    if (isAbsoluteUrl(rawResumeUrl)) {
      return rawResumeUrl;
    }

    const normalizedPath = rawResumeUrl.startsWith("/")
      ? rawResumeUrl
      : `/${rawResumeUrl}`;

    if (normalizedPath.startsWith("/uploads/")) {
      return `http://localhost:8001${normalizedPath}`;
    }

    return `${getBaseUrl()}${normalizedPath}`;
  }

  return `${getBaseUrl()}/applicants/${applicant.id}/resume`;
};

const triggerFileDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
};

export const downloadApplicantResume = async (applicant: IApplicant) => {
  const url = getResumeUrl(applicant);
  const filename = `${applicant.fullName.trim()}-resume.pdf`;
  const proxyDownloadUrl = `/api/applicants/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

  try {
    const token = getCookies(authKey);

    const response = await fetch(proxyDownloadUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    triggerFileDownload(blob, filename);
  } catch (error) {
    console.error("Resume download failed:", error);
    toast.error("Failed to download resume");
  }
};
