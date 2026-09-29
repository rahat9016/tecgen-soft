import AccountShell from "@/src/components/gadgets/account/AccountShell";

export const metadata = { title: "My Account | gadgethub" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
