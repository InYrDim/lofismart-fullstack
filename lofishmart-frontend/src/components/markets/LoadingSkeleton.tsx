import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />
        ))}
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-200" />
    </div>
  );
}
