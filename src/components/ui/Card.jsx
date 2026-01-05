import React from "react";

export function Card({ className = "", ...props }) {
  return (
    <div
      {...props}
      className={[
        // IMPORTANT: no mx-auto, no max-w, no place-items-center
        "rounded-2xl bg-white text-slate-900 shadow-sm",
        className,
      ].join(" ")}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return <div {...props} className={["p-6 pb-3", className].join(" ")} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 {...props} className={["text-lg font-semibold leading-none tracking-tight", className].join(" ")} />;
}

export function CardContent({ className = "", ...props }) {
  return <div {...props} className={["p-6 pt-0", className].join(" ")} />;
}
