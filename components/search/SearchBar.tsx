import React, { ChangeEvent } from "react";
import { debounce } from "@/utils";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  itemsFile: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ handleInputChange, itemsFile }) => {
  return (
    <nav id="controls">
      <div className="mb-6">
        Fetching from <pre className="inline p-2 rounded-md">{itemsFile}</pre>
      </div>
      <input type="text" onChange={handleInputChange} />
    </nav>
  );
};
