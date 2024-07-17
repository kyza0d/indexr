import Papa from 'papaparse';

interface ParsedData {
  [key: string]: any;
}

export const parseCSV = (file: File): Promise<ParsedData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          reject(new Error(`Error parsing CSV file: ${results.errors[0].message}`));
        } else if (!results.data || results.data.length === 0) {
          reject(new Error('CSV file is empty or invalid'));
        } else {
          let headers: string[] = [];
          let startIndex = 0;
          const firstRow = results.data[0] as string[];

          // Detect if the CSV has headers
          const hasHeaders = detectHeaders(firstRow, results.data[1] as string[]);

          if (hasHeaders) {
            headers = firstRow.map(String);
            startIndex = 1;
          } else {
            // Generate numeric headers if no headers are present
            headers = firstRow.map((_, index) => `Column ${index + 1}`);
          }

          const parsedData = results.data.slice(startIndex).map((row: unknown, rowIndex: number) => {
            const item: ParsedData = { key: rowIndex.toString() };
            if (Array.isArray(row)) {
              headers.forEach((header, index) => {
                if (index < row.length && header.trim() !== '') {
                  item[header] = row[index];
                }
              });
            }
            return item;
          });
          resolve(parsedData);
        }
      },
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
  });
};

// Helper function to detect if the CSV has headers
const detectHeaders = (firstRow: string[], secondRow: string[]): boolean => {
  if (!secondRow) return false; // If there's only one row, assume it's data without headers

  // Check if the first row is significantly different from the second row
  const firstRowTypes = firstRow.map(getValueType);
  const secondRowTypes = secondRow.map(getValueType);

  // If the types of values in the first and second row are different, assume the first row is headers
  return firstRowTypes.some((type, index) => type !== secondRowTypes[index]);
};

// Helper function to get the type of a value
const getValueType = (value: string): string => {
  if (value === "" || value === null) return "empty";
  if (!isNaN(Number(value))) return "number";
  return "string";
};

// Helper function to handle empty first column
export const handleEmptyFirstColumn = (parsedData: ParsedData[]): ParsedData[] => {
  if (parsedData.length === 0) return parsedData;

  const firstItemKeys = Object.keys(parsedData[0]);
  if (firstItemKeys.includes('')) {
    return parsedData.map(item => {
      const { ['']: _, ...rest } = item;
      return rest;
    });
  }
  return parsedData;
};

// Main function to process CSV data
export const processCSV = async (file: File): Promise<ParsedData[]> => {
  try {
    let parsedData = await parseCSV(file);
    parsedData = handleEmptyFirstColumn(parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};
