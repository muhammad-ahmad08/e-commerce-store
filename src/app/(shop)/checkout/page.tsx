import { redirect } from "next/navigation";
import CheckoutForm from "@/components/shop/CheckoutForm";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/checkout");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <CheckoutForm
      initialFullName={profile?.full_name ?? ""}
      initialPhone={profile?.phone ?? ""}
    />
  );
}
