import { CodeBackdrop } from "@/components/layout/code-backdrop";
import { DecorLayer } from "@/components/layout/decor-layer";
import { PrimaryButton } from "@/components/shared/primary-button";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <CodeBackdrop />
      <DecorLayer mode="home" />
      <main className="page-shell">
        <section className="site-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="matching-empty-card">
            <p className="eyebrow warm">404</p>
            <h1>ไม่พบหน้าที่คุณหา</h1>
            <p className="lead">หน้านี้ไม่มีอยู่จริง หรืออาจถูกย้ายไปแล้ว</p>
            <Link href="/">
              <PrimaryButton fullWidth>กลับหน้าแรก</PrimaryButton>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
