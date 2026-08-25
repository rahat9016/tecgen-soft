"use client";

import { ICareer } from "@/src/components/admin/Career/types";
import { useGet } from "@/src/hooks/useGet";
import {
  formatEmploymentType,
  formatExperience,
  formatSalary,
} from "@/src/utils/careerFormatters";
import { formatDate } from "@/src/utils/formatDate";
import {
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  MapPin,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import NotFoundData from "../../shared/NotFoundData";
import { Button } from "../../ui/button";
import ApplyJobModal from "./ApplyJobModal";
import CareerDetailsSkeleton from "./CareerDetailsSkeleton";
import CareerShare from "./CareerShare";

export default function CareerDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGet<ICareer>(`/career/${id}`, ["career", id]);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = `${baseUrl}/career/${id}`;

  if (isLoading) {
    return <CareerDetailsSkeleton />;
  }

  if (!data?.data) {
    return (
      <div className="container mt-6 mb-10 lg:mb-20">
        <div className="mb-4">
          <DynamicBreadcrumb />
        </div>
        <NotFoundData />
      </div>
    );
  }

  return (
    <div className="container mt-6 mb-10 lg:mb-20">
      <div className="mb-4 lg:mb-5">
        <DynamicBreadcrumb />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
        <div>
          <h1 className="text-secondary text-2xl lg:text-4xl font-semibold mb-2">
            {data?.data?.title}
          </h1>
          <p className="text-secondary-foreground text-lg">
            <span className="font-semibold ">Published:</span>{" "}
            {formatDate(data.data.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <p className="text-primary text-xl font-semibold whitespace-nowrap">
            Share Jobs:
          </p>
          <CareerShare title={data?.data?.title} url={shareUrl} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 lg:mt-10">
        <div className="lg:col-span-2">
          <div className="prose prose-neutral max-w-none prose-p:text-secondary-foreground prose-li:text-secondary-foreground prose-h1:text-secondary prose-h2:text-secondary prose-h3:text-secondary">
            <div
              dangerouslySetInnerHTML={{ __html: data?.data?.description }}
            />
          </div>
        </div>

        <div className="bg-light rounded-2xl p-6 lg:p-8 border border-light-dark h-fit">
          <h3 className="text-3xl text-secondary-foreground font-semibold mb-6">
            Summary
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-secondary-foreground">
              <MapPin className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground">
                  Job Location:
                </span>{" "}
                {data.data.location}
              </p>
            </div>

            <div className="flex items-start gap-3 text-secondary-foreground">
              <BriefcaseBusiness className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground">
                  Employment Status:
                </span>{" "}
                {formatEmploymentType(data.data.jobType)}
              </p>
            </div>

            <div className="flex items-start gap-3 text-secondary-foreground">
              <BriefcaseBusiness className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground">
                  Experience:
                </span>{" "}
                {formatExperience(data.data.experience)}
              </p>
            </div>

            <div className="flex items-start gap-3 text-secondary-foreground">
              <Users className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground ">
                  Vacancy:
                </span>{" "}
                {data.data.vacancy}
              </p>
            </div>

            <div className="flex items-start gap-3 text-secondary-foreground">
              <Coins className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground">
                  Salary Range:
                </span>{" "}
                {formatSalary(data.data.salary, data.data.currency)}
              </p>
            </div>

            <div className="flex items-start gap-3 text-secondary-foreground">
              <CalendarDays className="w-5 h-5 mt-0.5 text-secondary-foreground" />
              <p>
                <span className="font-semibold text-base text-secondary-foreground ">
                  Deadline:
                </span>{" "}
                {formatDate(data.data.deadline)}
              </p>
            </div>
          </div>

          <Button
            className="mt-7 px-8"
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply Now
          </Button>
        </div>
      </div>

      <ApplyJobModal
        open={isApplyModalOpen}
        onOpenChange={setIsApplyModalOpen}
        careerId={data.data.id}
        careerTitle={data.data.title}
      />
    </div>
  );
}
