import { ChangeEvent } from "react";
import { Input } from "../ui/input";

interface SearchBarProps {
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchBarProps> = ({ handleInputChange }) => {
  return (
    <Input
      type="text"
      onChange={handleInputChange}
      placeholder="Start searching"
    />
  );
};


export default SearchInput;
