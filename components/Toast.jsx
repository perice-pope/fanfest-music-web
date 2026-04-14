"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Trigger entrance animation
      requestAnimationFrame(() => setVisible(true));
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`px-5 py-3 rounded-xl bg-brand text-white text-sm font-semibold shadow-lg transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
