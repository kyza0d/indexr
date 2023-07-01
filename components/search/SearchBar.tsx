import React, { ChangeEvent } from "react";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ handleInputChange }) => {
  return (
    <nav id="controls" className="w-full h-12 my-0">
      <input type="text" onChange={handleInputChange} />
    </nav>
  );
};
