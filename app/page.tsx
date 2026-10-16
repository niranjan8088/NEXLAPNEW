import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MarketplaceHome from "@/components/MarketplaceHome";

export const metadata: Metadata = {
  title: "Nex LapTech | Shop Laptops, Components & Accessories",
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("nexbyte_admin_session")?.value;
  const resellerSession = cookieStore.get("nexbyte_reseller_session")?.value;
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;

  // Keep the storefront as the public home while exposing active portals in its header.
  return (
    <MarketplaceHome
      hasAdminSession={Boolean(adminSession)}
      hasResellerSession={Boolean(resellerSession)}
      hasUserSession={Boolean(userSession)}
    />
  );
}
