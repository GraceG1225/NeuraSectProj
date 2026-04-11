"use client";

import React from "react";

export type BannerType = "success" | "error" | "info" | "warning";

export interface Banner {
  type: BannerType;
  message: string;
  section: string;
}

interface InlineBannerProps {
  banner: Banner | null;
  onDismiss: () => void;
}

export const InlineBanner: React.FC<InlineBannerProps> = ({ banner, onDismiss }) => {
  if (!banner) return null;

  const styles: Record<BannerType, string> = {
    success: "bg-green-50 border-green-300 text-green-800",
    error: "bg-red-50 border-red-300 text-red-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
  };

  const icons: Record<BannerType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border mt-4 text-sm font-medium ${styles[banner.type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{icons[banner.type]}</span>
        <span>{banner.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="opacity-60 hover:opacity-100 text-lg leading-none ml-4"
      >
        ×
      </button>
    </div>
  );
};