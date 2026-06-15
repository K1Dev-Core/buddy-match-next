import { SeniorDashboard } from "@/components/senior/senior-dashboard";
import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SeniorPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? "";

      if (!email || !(await isAllowedSeniorEmail(email, supabase))) {
        redirect("/?auth=unauthorized");
      }
    } catch {
      redirect("/?auth=exchange_failed");
    }
  }

  return <SeniorDashboard />;
}
