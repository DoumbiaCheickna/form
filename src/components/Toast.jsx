import { useEffect } from "react";

const colorMap = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-[var(--color-primary)]",
};

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top duration-300 w-full max-w-md px-4">
      <div
        className={`${colorMap[type]} text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 break-words`}
      >
        {type === "success" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === "error" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {message}
      </div>
    </div>
  );
}
