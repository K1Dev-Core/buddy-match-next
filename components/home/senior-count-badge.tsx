"use client";

import { Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SeniorCountBadge() {
  const [displayCount, setDisplayCount] = useState(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/match/senior-count");
        const data = await res.json();
        const newTarget = typeof data.count === "number" ? data.count : 0;
        animateTo(newTarget);
      } catch {
        /* keep current */
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  function animateTo(target: number) {
    targetRef.current = target;
    const start = displayRef.current;
    const diff = target - start;
    if (diff === 0) return;

    const duration = 400;
    const startTime = performance.now();

    cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      displayRef.current = current;
      setDisplayCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplayCount(target);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="senior-count-bar">
      <Users size={16} strokeWidth={2.2} />
      <span>
        มีรุ่นพี่พร้อมรับน้อง{" "}
        <span className="count-num">
          {displayCount}
        </span>{" "}
        คน
      </span>
    </div>
  );
}
