import React, { ChangeEvent } from "react";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ handleInputChange }) => {
  return (
    <nav id="bar" className="w-full flex justify-stretch my-8 border dark:border-[#545454]">
      <input className="px-2" type="text" onChange={handleInputChange} />
    </nav>
  );
};
