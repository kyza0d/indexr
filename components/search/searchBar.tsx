import { ChangeEvent } from "react";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ handleInputChange }) => {
  return (
    <nav id="bar" className="w-full flex justify-stretch my-8 border border-gray-400 ml-[-1px]">
      <input className="px-2" type="text" onChange={handleInputChange} />
    </nav>
  );
};
