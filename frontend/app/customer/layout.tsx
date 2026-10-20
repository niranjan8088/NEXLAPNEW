import CustomerLayoutShell from "@/components/CustomerLayoutShell";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayoutShell>{children}</CustomerLayoutShell>;
}
