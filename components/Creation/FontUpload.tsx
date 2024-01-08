import React, { useState } from 'react';

const FontUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append('font', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
        // Removed the Content-Type header
      });

      if (response.ok) {
        alert('Upload successful');
      } else {
        alert('Upload failed');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".ttf, .otf" onChange={handleFileChange} />
      <button type="submit">Upload Font</button>
    </form>
  );
};

export default FontUpload;
