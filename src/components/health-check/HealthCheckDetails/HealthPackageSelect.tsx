"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { IHealthCheckPackage } from "@/src/components/health-check/types";

interface HealthPackageSelectProps {
  packages: IHealthCheckPackage[];
  value?: string;
  loading?: boolean;
  onChange: (value: string) => void;
}

export default function HealthPackageSelect({
  packages,
  value,
  loading = false,
  onChange,
}: HealthPackageSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue placeholder="Choose a package" />
      </SelectTrigger>

      <SelectContent>
        {packages.map((pkg) => (
          <SelectItem key={pkg.id} value={pkg.id}>
            {pkg.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
