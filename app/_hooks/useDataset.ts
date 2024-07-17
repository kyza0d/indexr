import { useState } from 'react';
import { parseData } from '@/utils/data';
import { processCSV } from '@/utils/parseCSV';

export const useDataset = () => {
  const [dataset, setDataset] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadDataset = async (file: File) => {
    try {
      let processedData;
      if (file.type === 'application/json') {
        processedData = await parseData(file);
      } else if (file.type === 'text/csv') {
        processedData = await processCSV(file);
      } else {
        throw new Error('Unsupported file type');
      }
      setDataset(processedData);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error processing dataset:', error);
      setError('Error processing file. Please try again.');
      return false;
    }
  };

  const fetchDataset = async (url: string) => {
    try {
      // Convert GitHub blob URL to raw content URL
      if (url.includes('github.com') && url.includes('/blob/')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      const fileExtension = url.split('.').pop()?.toLowerCase();

      let processedData;
      if (fileExtension === 'json') {
        const jsonData = JSON.parse(content);
        processedData = await parseData(new File([JSON.stringify(jsonData)], 'dataset.json', { type: 'application/json' }));
      } else if (fileExtension === 'csv') {
        processedData = await processCSV(new File([content], 'dataset.csv', { type: 'text/csv' }));
      } else {
        throw new Error('Unsupported file format');
      }

      setDataset(processedData);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error fetching dataset:', error);
      setError(`Error fetching or processing the file: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the URL and try again.`);
      return false;
    }
  };

  return { dataset, uploadDataset, fetchDataset, error };
};
