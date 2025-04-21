
import { ColumnStats, DataType, ImputationMethod, EncodingMethod, ProcessedData } from "../types/data";

// Parse CSV string into array of arrays
export function parseCSV(csvString: string): string[][] {
  const lines = csvString.trim().split("\n");
  return lines.map(line => {
    // Handle quoted values with commas inside
    const result = [];
    let insideQuotes = false;
    let currentValue = "";
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue.trim());
    return result;
  });
}

// Detect data type of a column
export function detectDataType(values: any[]): DataType {
  const nonEmptyValues = values.filter(val => val !== null && val !== undefined && val !== "");
  
  if (nonEmptyValues.length === 0) return 'unknown';
  
  const numericCount = nonEmptyValues.filter(val => !isNaN(Number(val)) && val !== "").length;
  
  if (numericCount / nonEmptyValues.length > 0.7) {
    return 'numeric';
  }
  
  return 'categorical';
}

// Calculate basic statistics for a column
export function calculateColumnStats(columnData: any[], columnName: string): ColumnStats {
  const nonEmptyValues = columnData.filter(val => val !== null && val !== undefined && val !== "");
  const missingCount = columnData.length - nonEmptyValues.length;
  const missingPercentage = (missingCount / columnData.length) * 100;
  
  const dataType = detectDataType(columnData);
  let suggestedImputation: ImputationMethod = 'none';
  let suggestedEncoding: EncodingMethod = 'none';
  
  // Initialize stats object
  const stats: ColumnStats = {
    name: columnName,
    dataType,
    missingCount,
    missingPercentage,
    suggestedImputation,
    selectedImputation: 'none',
    suggestedEncoding,
    selectedEncoding: 'none'
  };
  
  if (dataType === 'numeric') {
    const numericValues = nonEmptyValues.map(val => Number(val));
    
    // Calculate numeric stats
    stats.min = Math.min(...numericValues);
    stats.max = Math.max(...numericValues);
    stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    
    // Calculate median
    const sortedValues = [...numericValues].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    stats.median = sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
    
    // Suggest imputation method based on data distribution
    stats.suggestedImputation = 'mean';
    stats.selectedImputation = 'mean';
  } 
  
  if (dataType === 'categorical') {
    // Calculate mode for categorical data
    const valueCounts: Record<string, number> = {};
    nonEmptyValues.forEach(val => {
      valueCounts[val] = (valueCounts[val] || 0) + 1;
    });
    
    let maxCount = 0;
    for (const [val, count] of Object.entries(valueCounts)) {
      if (count > maxCount) {
        maxCount = count;
        stats.mode = val;
      }
    }
    
    // Get unique values
    stats.uniqueValues = [...new Set(nonEmptyValues)].map(v => String(v));
    
    // Suggest mode for imputation and label encoding
    stats.suggestedImputation = 'mode';
    stats.selectedImputation = 'mode';
    stats.suggestedEncoding = 'label';
    stats.selectedEncoding = 'label';
  }
  
  return stats;
}

// Process data: analyze columns and prepare for imputation
export function processData(csvData: string[][]): ProcessedData {
  if (csvData.length < 2) {
    throw new Error("CSV data must contain at least a header row and one data row");
  }
  
  const headers = csvData[0];
  const data = csvData.slice(1);
  
  // Transpose data to get columns
  const columns = headers.map((_, colIndex) => 
    data.map(row => row[colIndex])
  );
  
  // Calculate statistics for each column
  const columnStats = columns.map((column, index) => 
    calculateColumnStats(column, headers[index])
  );
  
  return {
    originalData: data,
    headers: headers,
    processedData: [...data], // Clone data for later processing
    columnStats: columnStats,
    encodingMappings: {}
  };
}

// Impute missing values in data
export function imputeData(processedData: ProcessedData): ProcessedData {
  const result = {...processedData};
  const { headers, originalData, columnStats } = result;
  
  // Create a deep copy of the original data
  result.processedData = JSON.parse(JSON.stringify(originalData));
  
  // Process each column
  columnStats.forEach((column, colIndex) => {
    if (column.selectedImputation === 'none') return;
    
    // Get imputation value based on selected method
    let imputationValue: any;
    switch (column.selectedImputation) {
      case 'mean':
        imputationValue = column.mean;
        break;
      case 'median':
        imputationValue = column.median;
        break;
      case 'mode':
        imputationValue = column.mode;
        break;
      case 'custom':
        imputationValue = column.customValue;
        break;
      default:
        return;
    }
    
    // Apply imputation to missing values
    for (let rowIndex = 0; rowIndex < result.processedData.length; rowIndex++) {
      const cellValue = result.processedData[rowIndex][colIndex];
      if (cellValue === "" || cellValue === null || cellValue === undefined) {
        result.processedData[rowIndex][colIndex] = imputationValue;
      }
    }
  });
  
  return result;
}

// Encode categorical variables
export function encodeData(processedData: ProcessedData): ProcessedData {
  const result = {...processedData};
  const encodingMappings: Record<string, Record<string, number>> = {};
  
  // Process each column that needs encoding
  result.columnStats.forEach((column, colIndex) => {
    if (column.dataType !== 'categorical' || column.selectedEncoding === 'none') {
      return;
    }
    
    const columnName = result.headers[colIndex];
    
    // Create label encoding mapping
    if (column.selectedEncoding === 'label' && column.uniqueValues) {
      const mapping: Record<string, number> = {};
      column.uniqueValues.forEach((value, index) => {
        mapping[value] = index;
      });
      
      encodingMappings[columnName] = mapping;
      
      // Apply label encoding
      for (let rowIndex = 0; rowIndex < result.processedData.length; rowIndex++) {
        const value = String(result.processedData[rowIndex][colIndex]);
        if (value in mapping) {
          result.processedData[rowIndex][colIndex] = mapping[value];
        }
      }
    }
    
    // One-hot encoding would go here, but we'll implement it in a future version
    // since it requires adding new columns to the data
  });
  
  result.encodingMappings = encodingMappings;
  return result;
}

// Convert processed data to CSV string
export function dataToCSV(data: any[][], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = data.map(row => 
    row.map(cell => {
      // Handle commas and quotes in cells
      if (cell === null || cell === undefined) {
        return '';
      }
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

// Generate encoding mappings file as CSV
export function mappingsToCSV(encodingMappings: Record<string, Record<string, number>>): string {
  const rows = ['Column,Original Value,Encoded Value'];
  
  for (const [column, mapping] of Object.entries(encodingMappings)) {
    for (const [original, encoded] of Object.entries(mapping)) {
      rows.push(`${column},${original},${encoded}`);
    }
  }
  
  return rows.join('\n');
}

// Generate encoding mappings as JSON
export function mappingsToJSON(encodingMappings: Record<string, Record<string, number>>): string {
  return JSON.stringify(encodingMappings, null, 2);
}
