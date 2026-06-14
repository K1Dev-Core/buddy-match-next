import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? "";

      if (!email || !isAllowedSeniorEmail(email)) {
        redirect("/?auth=unauthorized");
      }

      const seniorId = email.replace("@msu.ac.th", "");
      const { data: adminCheck } = await supabase
        .from("seniors")
        .select("is_admin")
        .eq("id", seniorId)
        .maybeSingle();

      if (!adminCheck?.is_admin) {
        redirect("/senior");
      }
    } catch {
      redirect("/?auth=exchange_failed");
    }
  }

  return <AdminDashboard />;
}
