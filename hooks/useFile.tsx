import { useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  type: string;
  size: string;
  lastModified: string;
  content?: string; // Optional content of the file
}

function useFile(file: File | null) {
  const [fileInfo, setFileInfo] = useState<FileInfo>({
    name: '',
    type: '',
    size: '0 bytes',
    lastModified: '',
    content: '', // Initialize content as an empty string
  });

  useEffect(() => {
    if (file) {
      // Read the file as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result as string;

        // Format size from bytes to KB if necessary
        const formattedSize = file.size > 1024 ? `${(file.size / 1024).toFixed(2)} KB` : `${file.size} bytes`;

        // Convert lastModified to a readable date
        const date = new Date(file.lastModified);
        const formattedDate = date.toLocaleDateString();

        // Update state with new file information and content
        setFileInfo({
          name: file.name,
          type: file.type || 'N/A',
          size: formattedSize,
          lastModified: formattedDate,
          content: text,
        });
      };
      reader.readAsText(file); // Read the file content as text
    }
  }, [file]);

  return fileInfo;
}

export default useFile;
