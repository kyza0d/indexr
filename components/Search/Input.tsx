import { ChangeEvent } from "react";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchBarProps> = ({ handleInputChange }) => {
  return (
    <input
      type="text"
      onChange={handleInputChange}
      placeholder="Start searching"
      className="my-8 w-full rounded-md border border-neutral-300 bg-neutral-100 px-4 placeholder-neutral-400 dark:border-neutral-600 dark:bg-neutral-950"
    />
  );
};


export default SearchInput;
