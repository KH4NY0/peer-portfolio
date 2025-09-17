"use client";

import React from "react";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#facc15" : "none"} stroke={filled ? "#facc15" : "currentColor"} strokeWidth="1.4">
      <path d="M12 17.3l-5.5 3 1.1-6.3-4.5-4.4 6.3-.9L12 3l2.6 5.7 6.3.9-4.5 4.4 1.1 6.3z"/>
    </svg>
  );
}

export function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <button key={n} type="button" className="p-0.5" onClick={() => onChange(n)} aria-label={`Rate ${n}`}>
          <Star filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
