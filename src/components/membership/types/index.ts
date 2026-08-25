export type MembershipType = "general" | "corporate";

export type CorporatePackage = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  notices: string[];
  status: string;
};

export type CorporatePackageSelection = {
  id: string;
  title: string;
};
