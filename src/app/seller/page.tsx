import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import SellerDashboard from "./SellerDashboard";

export const revalidate = 0;

export default async function SellerPage() {
  const cookieStore = await cookies();
  const sellerId = cookieStore.get("wave-seller")?.value;

  if (!sellerId) {
    redirect("/seller/login");
  }

  const { data: seller } = await supabaseAdmin
    .from("sellers")
    .select("id, name, email")
    .eq("id", sellerId)
    .maybeSingle();

  if (!seller) {
    redirect("/seller/login");
  }

  const { data: guests } = await supabaseAdmin
    .from("vip_accounts")
    .select("id, name, email, company, title, created_at, point_of_contact")
    .eq("point_of_contact", seller.name)
    .order("created_at", { ascending: false });

  return (
    <SellerDashboard
      seller={seller}
      initialGuests={guests ?? []}
    />
  );
}
