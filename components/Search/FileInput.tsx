import React from 'react';

interface FileInputProps {
  handleFileSelect: (file: File) => void;
}

const FileInput: React.FC<FileInputProps> = ({ handleFileSelect }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
  };

  return (
    <div>
      <button className="ml-3 mr-20 h-10 w-fit rounded-md border px-4 -outline-offset-1 dark:border-neutral-600"
        onClick={() => document.getElementById('file-input')?.click()} // Open file dialog on click
      >
        Create New
      </button>
      <input
        id="file-input"
        type="file"
        className="hidden" // Hide the file input element
        onChange={handleChange} // Set up the change handler
      />
    </div>
  );
};

export default FileInput;
