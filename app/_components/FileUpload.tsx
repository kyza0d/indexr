import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className="p-6 mt-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gray-50"
    >
      <input {...getInputProps()} />
      <p className="text-lg font-semibold">
        {isDragActive ? "Drop the file here" : "Drag 'n' drop a dataset file, or click to select"}
      </p>
      <p className="text-sm text-gray-500 mt-2">Supported formats: JSON, CSV</p>
    </div>
  );
};

export default FileUpload;
