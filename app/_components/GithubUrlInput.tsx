import React, { useState } from 'react';
import { Button } from "@/components/ui/button"

interface GitHubUrlInputProps {
  onUrlSubmit: (url: string) => Promise<boolean>;
}

const GitHubUrlInput: React.FC<GitHubUrlInputProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setIsLoading(true);
      const success = await onUrlSubmit(url.trim());
      setIsLoading(false);
      if (success) {
        setUrl(''); // Clear the input on success
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter GitHub file URL"
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Fetching...' : 'Fetch Dataset'}
      </Button>
    </form>
  );
};

export default GitHubUrlInput;
