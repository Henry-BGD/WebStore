import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        // IMPORTANT: no mx-auto, no w-fit, no centering wrappers
        "block w-full rounded-md border border-slate-300 bg-white px-3 py-2",
        "text-sm outline-none",
        "focus:ring-2 focus:ring-blue-300 focus:border-blue-300",
        className,
      ].join(" ")}
    />
  );
}
