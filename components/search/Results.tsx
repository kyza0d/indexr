import React from "react";
import { useSettings } from "@/components/settings";

interface ResultsProps {
  results: JSX.Element[];
}

export const Results: React.FC<ResultsProps> = ({ results }) => {
  const { config } = useSettings();

  const getLayoutClass = (layout: string): string => {
    switch (layout) {
      case "Grid View":
        return "grid grid-cols-4 gap-4 px-2";
      case "List View":
        return "flex flex-col";
      case "Detail View":
        return "grid grid-cols-1 gap-6";
      case "Card View":
        return "grid grid-cols-2 gap-4";
      case "Tile View":
        return "grid grid-cols-12 gap-2 whitespace-nowrap text-sm";
      case "Compact View":
        return "flex flex-row flex-wrap";
      case "Small Square View":
        return "grid grid-cols-6 gap-1";
      default:
        return "grid grid-cols-3 gap-4";
    }
  };

  const layoutClass = getLayoutClass(config.layout);

  return (
    <div className={`${layoutClass}`}>
      {results.map((result, index) => (
        <p key={index} className="overflow-x-hidden text-ellipsis">
          {result}
        </p>
      ))}
    </div>
  );
};
