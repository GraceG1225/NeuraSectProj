'use client';

import Link from "next/link";
import { FaHome, FaPalette } from "react-icons/fa";
import { PageKey, ThemeId, useThemeConfig } from "../components/theme/themeContext";

const PAGE_OPTIONS: { key: PageKey; label: string; description: string }[] = [
  { key: "home", label: "Home", description: "Landing hero and call-to-action sections." },
  { key: "explainability", label: "Explainability", description: "Model interpretability overview." },
  { key: "datasets", label: "Datasets List", description: "Dataset cards inside the home page." },
  { key: "datasetDetail", label: "Dataset Detail", description: "Individual dataset drill-down page." },
];

export default function SettingsPage() {
  const { presets, pageThemes, setThemeForPage } = useThemeConfig();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-2">
              <FaPalette /> Theme Settings
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">Customize Page Themes</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Pick a pastel preset for each page. Your choices are saved to your browser so the site
              remembers your look across visits.
            </p>
          </div>
          <Link href="/" className="btn btn-outline px-4 py-2 flex items-center gap-2">
            <FaHome /> Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAGE_OPTIONS.map((page) => {
            const themeId = pageThemes[page.key];
            const theme = presets[themeId];

            return (
              <div key={page.key} className="card card-hover p-6 space-y-4">
                <div
                  className="h-24 rounded-lg border border-gray-100"
                  style={{ backgroundImage: theme.background }}
                ></div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{page.label}</h2>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {theme.name}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Theme preset</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-gray-800 bg-white"
                    value={themeId}
                    onChange={(e) => setThemeForPage(page.key, e.target.value as ThemeId)}
                  >
                    {Object.values(presets).map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} — {preset.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



