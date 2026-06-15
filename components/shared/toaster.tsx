"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toaster-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div className={`toast toast-${toast.type} ${exiting ? "toast-exit" : ""}`} onClick={handleDismiss}>
      <span>{toast.message}</span>
    </div>
  );
}
