"use client";

import React, { useEffect, useState } from "react";
import { useSettings } from "@/components/settings/SettingsContext";

interface ResultsProps {
  results: JSX.Element[];
}

type LayoutMode = "Grid View" | "List View" | "Detail View" | "Card View" | "Compact View" | "Tile View";

const layoutClassMap: Record<LayoutMode, string> = {
  "Grid View": "grid grid-cols-4 gap-4 px-2",
  "List View": "flex flex-col",
  "Detail View": "grid grid-cols-1 gap-6",
  "Card View": "grid grid-cols-2 gap-4",
  "Compact View": "flex flex-row flex-wrap",
  "Tile View": "grid grid-cols-10 gap-2 text-sm",
};

export const Results: React.FC<ResultsProps> = ({ results }) => {
  const { config } = useSettings();
  const fallbackClass = layoutClassMap["Grid View"];
  const [layoutClass, setLayoutClass] = useState(fallbackClass);

  useEffect(() => {
    setLayoutClass(layoutClassMap[config.layout as LayoutMode] || fallbackClass);
  }, [config.layout]);

  return (
    <div className={layoutClass}>
      {results.map((result, index) => (
        <div key={index} className="whitespace-pre-wrap break-all">
          {result}
        </div>
      ))}
    </div>
  );
};
