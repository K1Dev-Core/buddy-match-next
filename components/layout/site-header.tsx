"use client";

import { SeniorAuthModal } from "@/components/auth/senior-auth-modal";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/browser";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { CircleUserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function SiteHeader() {
  const { navigate } = usePageTransition();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const authError = searchParams.get("auth");

  const description = useMemo(() => {
    if (userEmail) {
      return "คุณเข้าสู่ระบบในฐานะรุ่นพี่แล้ว";
    }

    return "ใช้ได้เฉพาะบัญชี Google ของมหาวิทยาลัยและต้องอยู่ในรายชื่อรุ่นพี่ที่กำหนดไว้เท่านั้น";
  }, [userEmail]);

  const errorMessage = useMemo(() => {
    if (authError === "unauthorized") {
      return "บัญชีนี้ไม่มีสิทธิ์เข้าใช้ระบบรุ่นพี่";
    }

    if (authError === "exchange_failed") {
      return "ล็อกอินไม่สำเร็จ ลองใหม่อีกครั้ง";
    }

    if (authError === "missing_code") {
      return "ระบบไม่ได้รับ code จาก Google";
    }

    return "";
  }, [authError]);

  const isSignedIn = Boolean(userEmail);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
      setUserAvatar(data.user?.user_metadata?.avatar_url ?? "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
      setUserAvatar(session?.user?.user_metadata?.avatar_url ?? "");
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setIsModalOpen(true);
    }
  }, [errorMessage]);

  const loginWithGoogle = async () => {
    if (!hasSupabaseBrowserEnv()) {
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/senior`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          hd: "msu.ac.th",
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <>
      <header className="site-shell site-header">
        <div className="brand-mark" aria-label="Brand">
          CodeLineage
        </div>
        <div className="header-actions">
          {isSignedIn ? (
            <button
              className="icon-button"
              aria-label="Dashboard"
              onClick={() => navigate("/senior")}
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="user-avatar" />
              ) : (
                <CircleUserRound size={22} strokeWidth={2.3} />
              )}
            </button>
          ) : (
            <button
              className="icon-button"
              aria-label="Profile"
              onClick={() => setIsModalOpen(true)}
            >
              <CircleUserRound size={22} strokeWidth={2.3} />
            </button>
          )}
        </div>
      </header>
      <SeniorAuthModal
        description={description}
        errorMessage={
          errorMessage ||
          (!hasSupabaseBrowserEnv()
            ? "ยังไม่ได้ตั้งค่า Supabase environment variables"
            : "")
        }
        isLoading={isLoading}
        isOpen={isModalOpen}
        isSignedIn={false}
        onClose={() => setIsModalOpen(false)}
        onLogin={loginWithGoogle}
        userEmail={userEmail}
      />
    </>
  );
}
