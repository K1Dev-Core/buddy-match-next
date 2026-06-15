"use client";

import { usePageTransition } from "@/components/layout/use-page-transition";
import { PrimaryButton } from "@/components/shared/primary-button";
import { ChestViewer } from "@/components/reveal/chest-viewer";
import { GuessModal } from "@/components/reveal/guess-modal";
import { useChestPose } from "@/components/reveal/use-chest-pose";
import { decodeToken } from "@/lib/token";
import { playSound } from "@/lib/sound";
import {
  ArrowLeft,
  CheckCircle2,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type RevealExperienceProps = {
  token: string | null;
};

export function RevealExperience({ token }: RevealExperienceProps) {
  const { navigate } = usePageTransition();
  const { pose } = useChestPose();

  const decoded = useMemo(() => (token ? decodeToken(token) : null), [token]);
  const code = decoded?.code ?? null;

  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [seniorData, setSeniorData] = useState<Record<string, unknown> | null>(
    null,
  );

  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noteStage, setNoteStage] = useState<
    "closed" | "opening" | "transitioning" | "opened"
  >("closed");
  const openTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const validate = async () => {
      if (!decoded || !decoded.juniorId) {
        sessionStorage.removeItem("bm-senior");
        sessionStorage.removeItem("bm-revealed");
        setValidationError("ลิงก์ไม่ถูกต้อง");
        setIsValidating(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/match/lookup?juniorId=${encodeURIComponent(decoded.juniorId)}`,
        );
        const payload = await res.json();

        if (!res.ok || !payload) {
          sessionStorage.removeItem("bm-senior");
          sessionStorage.removeItem("bm-revealed");
          setValidationError("ไม่พบข้อมูลการสุ่มพี่รหัส");
          setIsValidating(false);
          return;
        }

        const oldRaw = sessionStorage.getItem("bm-senior");
        const oldSeniorId = oldRaw
          ? (JSON.parse(oldRaw)?.profile?.seniorId as string | undefined)
          : undefined;
        const newSeniorId = payload?.profile?.seniorId as string | undefined;

        sessionStorage.setItem("bm-senior", JSON.stringify(payload));
        setSeniorData(payload);

        if (oldSeniorId && newSeniorId && oldSeniorId !== newSeniorId) {
          sessionStorage.removeItem("bm-revealed");
        } else if (sessionStorage.getItem("bm-revealed") === "true") {
          setRevealed(true);
        }
      } catch {
        sessionStorage.removeItem("bm-senior");
        setValidationError("ตรวจสอบข้อมูลไม่สำเร็จ");
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [decoded]);

  const profile = seniorData?.profile as Record<string, unknown> | null;

  const fullName = (profile?.fullName as string) ?? "";
  const hints = (profile?.hints as string[]) ?? [];
  const contact = (profile?.contact as string) ?? "";
  const greetingText = (profile?.greeting as string) ?? "";
  const answerName = fullName;

  const strippedName = answerName
    .replace(/^(นาย|นางสาว|นาง|พี่|คุณ)\s*/i, "")
    .trim()
    .toLowerCase();
  const normalizedGuess = guess.trim().toLowerCase();
  const noteText =
    hints.length > 0 ? hints.join(" ") : "พี่รหัสของคุณยังไม่ได้เขียนคำใบ้";

  const openHintBox = () => {
    if (noteStage !== "closed") return;
    playSound("/assets/sfx/open.mp3");
    setNoteStage("opening");
    openTimerRef.current = window.setTimeout(() => {
      setNoteStage("transitioning");
      openTimerRef.current = window.setTimeout(() => {
        setNoteStage("opened");
      }, 520);
    }, 1500);
  };

  const submitGuess = () => {
    if (!normalizedGuess) {
      setErrorMessage("ใส่ชื่อก่อนน้า");
      return;
    }

    const isCorrect =
      answerName.trim().toLowerCase() === normalizedGuess ||
      strippedName === normalizedGuess;

    if (isCorrect) {
      sessionStorage.setItem("bm-revealed", "true");
      setRevealed(true);
      setErrorMessage("");
      setIsModalOpen(false);
      if (decoded?.juniorId && profile?.seniorId) {
        fetch("/api/log/guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            juniorId: decoded.juniorId,
            seniorId: profile.seniorId,
            seniorName: fullName
          })
        }).catch(() => {});
      }
      return;
    }

    setErrorMessage("ยังไม่ใช่ ลองอีกครั้ง");
  };

  if (isValidating) {
    return (
      <section className="reveal-shell reveal-shell-centered">
        <div style={{ width: "100%", maxWidth: "320px", margin: "0 auto" }}>
          <div className="skeleton-block" style={{ height: "200px", marginBottom: "16px" }} />
          <div className="skeleton-line" style={{ width: "60%" }} />
          <div className="skeleton-line" style={{ width: "40%" }} />
        </div>
      </section>
    );
  }

  if (validationError) {
    return (
      <section className="reveal-shell reveal-shell-centered">
        <div className="matching-empty-card">
          <p className="eyebrow warm">ผิดพลาด</p>
          <h1>{validationError}</h1>
          <p className="lead">ต้องเข้าระบบสุ่มพี่รหัสก่อนเข้าหน้านี้</p>
          <PrimaryButton onClick={() => navigate("/")} fullWidth>
            กลับหน้าแรก
          </PrimaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-shell reveal-shell-centered">
      <button
        className="back-button reveal-back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={20} strokeWidth={2.3} />
      </button>
      <div className="reveal-flow">
        {noteStage !== "opened" ? (
          <div className="unbox-stage">
            <div className="headline-stack compact reveal-center-headline">
              <p className="eyebrow warm">Mystery Box</p>
              <h1>กล่องคำใบ้พี่รหัสกำลังรอให้คุณเปิด</h1>
              <p className="lead">
                แตะเปิดกล่องก่อน แล้วค่อยอ่านคำใบ้ของสายเลือดโค้ดนี้
              </p>
            </div>
            <div
              className={`chest-scene ${noteStage === "opening" ? "is-opening" : ""} ${noteStage === "transitioning" ? "is-transitioning" : ""}`}
              aria-hidden="true"
            >
              <span className="chest-glow chest-glow-a" />
              <span className="chest-glow chest-glow-b" />
              <span className="chest-shadow" />
              <ChestViewer
                pose={pose}
                state={
                  noteStage === "closed"
                    ? "idle"
                    : noteStage === "opening"
                      ? "opening"
                      : "exiting"
                }
              />
              <span className="chest-pixel chest-pixel-1" />
              <span className="chest-pixel chest-pixel-2" />
              <span className="chest-pixel chest-pixel-3" />
              <span className="chest-pixel chest-pixel-4" />
            </div>
            <button
              className="open-box-button"
              onClick={openHintBox}
              disabled={noteStage !== "closed"}
            >
              {noteStage === "closed"
                ? "เปิดกล่องคำใบ้"
                : noteStage === "opening"
                  ? "กำลังเปิดกล่อง..."
                  : "กำลังเผยคำใบ้..."}
            </button>
          </div>
        ) : revealed ? (
          <div className="reveal-letter-page">
            <div className="reveal-letter">
              <div className="reveal-letter-header">
                <p className="reveal-letter-eyebrow">พี่ของคุณคือ!</p>
                <h1 className="reveal-letter-name">{fullName}</h1>
                <div className="reveal-letter-divider" />
              </div>
              <div className="reveal-letter-body">
                <div className="reveal-letter-badge">
                  <CheckCircle2 size={20} strokeWidth={2.6} />
                  <span>ข้อความจากพี่รหัสส่งต่อถึงคุณ</span>
                </div>
                {greetingText ? (
                  <p className="reveal-letter-greeting">{greetingText}</p>
                ) : null}
                {contact ? (
                  <div className="reveal-letter-contact">
                    <span className="reveal-letter-contact-label">
                      ช่องทางติดต่อ
                    </span>
                    <Link
                      href={
                        contact.startsWith("http")
                          ? contact
                          : `https://${contact}`
                      }
                      className="reveal-letter-contact-link"
                    >
                      <LinkIcon size={16} strokeWidth={2.4} />
                      <span>{contact}</span>
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="reveal-letter-footer" />
            </div>
          </div>
        ) : (
          <div className="reveal-note-stage">
            <div className="headline-stack compact reveal-center-headline">
              <p className="eyebrow warm">Secret Note</p>
              <h1>คำใบ้พี่รหัสของคุณ</h1>
              <p className="lead">ลองทายชื่อพี่รหัสของคุณ</p>
            </div>
            <article className="note-card">
              <div className="hint-sticker note-sticker">คำใบ้</div>
              <div className="note-card-inner">
                <p className="note-paragraph">{noteText}</p>
              </div>
            </article>
            <div className="note-actions">
              <PrimaryButton
                onClick={() => {
                  setIsModalOpen(true);
                  setErrorMessage("");
                }}
                fullWidth
                icon={<Sparkles size={18} strokeWidth={2.4} />}
              >
                ทายชื่อพี่รหัสเลย
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
      <GuessModal
        errorMessage={errorMessage}
        guess={guess}
        isOpen={isModalOpen}
        onChange={setGuess}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitGuess}
      />
    </section>
  );
}
