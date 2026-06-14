"use client";

import { usePageTransition } from "@/components/layout/use-page-transition";
import { PrimaryButton } from "@/components/shared/primary-button";
import { ChestViewer } from "@/components/reveal/chest-viewer";
import { GuessModal } from "@/components/reveal/guess-modal";
import { useChestPose } from "@/components/reveal/use-chest-pose";
import { decodeCode } from "@/lib/token";
import { getBuddyFromCode } from "@/lib/match";
import { ArrowLeft, CheckCircle2, Link as LinkIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type RevealExperienceProps = {
  token: string | null;
};

export function RevealExperience({ token }: RevealExperienceProps) {
  const { navigate } = usePageTransition();
  const { pose } = useChestPose();
  const code = useMemo(() => (token ? decodeCode(token) : null), [token]);
  const { buddy } = useMemo(() => getBuddyFromCode(code), [code]);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [noteStage, setNoteStage] = useState<"closed" | "opening" | "transitioning" | "opened">("closed");
  const openTimerRef = useRef<number | null>(null);

  const normalizedGuess = guess.trim().toLowerCase();
  const noteText = `พี่รหัสของคุณ${buddy.hints[0]} ${buddy.hints[1]} และ${buddy.hints[2]} ลองนึกดูดีๆ ว่าเขาคือใครในสายเลือดโค้ดของคุณ`;

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const openHintBox = () => {
    if (noteStage !== "closed") {
      return;
    }

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

    const isCorrect = buddy.answerAliases.some(
      (alias) => alias.trim().toLowerCase() === normalizedGuess
    );

    if (isCorrect) {
      setRevealed(true);
      setErrorMessage("");
      setIsModalOpen(false);
      return;
    }

    const nextAttempts = Math.max(attemptsLeft - 1, 0);
    setAttemptsLeft(nextAttempts);
    setErrorMessage(
      nextAttempts > 0
        ? `ยังไม่ใช่ ลองอีกครั้งได้อีก ${nextAttempts} ครั้ง`
        : "หมดโอกาสทายแล้ว ลองกลับไปเริ่มใหม่อีกครั้ง"
    );
  };

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
              <p className="lead">แตะเปิดกล่องก่อน แล้วค่อยอ่านโน้ตคำใบ้ลับของสายเลือดโค้ดนี้</p>
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
            <button className="open-box-button" onClick={openHintBox} disabled={noteStage !== "closed"}>
              {noteStage === "closed"
                ? "เปิดกล่องคำใบ้"
                : noteStage === "opening"
                  ? "กำลังเปิดกล่อง..."
                  : "กำลังเผยคำใบ้..."}
            </button>
          </div>
        ) : (
          <div className="reveal-note-stage">
            <div className="headline-stack compact reveal-center-headline">
              <p className="eyebrow warm">Mystery</p>
              <h1>คำใบ้พี่รหัสของคุณ</h1>
              <p className="lead">ลองทายชื่อว่าใครคือพี่รหัสของคุณก่อนจะกดเปิดเฉลย</p>
            </div>

            <article className="note-card">
              <div className="hint-sticker note-sticker">Mystery!</div>
              <div className="note-card-inner">
                <p className="note-label">Secret Note</p>
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
                disabled={attemptsLeft === 0 || revealed}
              >
                {revealed ? "เฉลยแล้ว" : "ทายชื่อพี่รหัสเลย"}
              </PrimaryButton>
              <p className="attempts">
                {revealed ? "คุณทายถูกแล้ว" : `คุณมีโอกาสทายอีก ${attemptsLeft} ครั้ง`}
              </p>
            </div>

            {revealed ? (
              <section className="revealed-buddy-card">
                <div className="revealed-buddy-image-wrap">
                  <Image
                    src={buddy.image}
                    alt={buddy.name}
                    fill
                    sizes="(max-width: 1024px) 280px, 360px"
                  />
                </div>
                <div className="revealed-buddy-copy">
                  <p className="eyebrow">Congratulations</p>
                  <h2>{buddy.name}</h2>
                  <p className="profile-meta">
                    {buddy.major} · {buddy.year}
                  </p>
                  <p className="profile-bio">{buddy.bio}</p>
                  <div className="success-panel">
                    <div className="success-badge">
                      <CheckCircle2 size={18} strokeWidth={2.4} />
                      <span>ยินดีด้วย ทายถูกแล้ว</span>
                    </div>
                    <p className="success-message">{buddy.greeting}</p>
                    <Link href={buddy.contactHref} className="contact-link">
                      <LinkIcon size={16} strokeWidth={2.4} />
                      <span>{buddy.contactLabel}</span>
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
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
