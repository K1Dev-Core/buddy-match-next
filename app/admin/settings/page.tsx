import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSettings } from "@/components/admin/admin-settings";

export default async function AdminSettingsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/?auth=unauthorized");
  }

  if (!(await isAllowedSeniorEmail(user.email, supabase))) {
    redirect("/?auth=unauthorized");
  }

  const seniorId = user.email.replace("@msu.ac.th", "");
  const { data: adminCheck } = await supabase
    .from("seniors")
    .select("is_admin")
    .eq("id", seniorId)
    .maybeSingle();

  if (!adminCheck?.is_admin) {
    redirect("/");
  }

  return <AdminSettings />;
}
