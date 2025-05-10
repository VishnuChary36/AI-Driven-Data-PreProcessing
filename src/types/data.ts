
export type DataType = 'numeric' | 'categorical' | 'unknown';

export type ImputationMethod = 'mean' | 'median' | 'mode' | 'custom' | 'none';

export type EncodingMethod = 'label' | 'one-hot' | 'none';

export interface ColumnStats {
  data: any;
  skewness: number;
  name: string;
  dataType: DataType;
  missingCount: number;
  missingPercentage: number;
  suggestedImputation: ImputationMethod;
  selectedImputation: ImputationMethod;
  suggestedEncoding: EncodingMethod;
  selectedEncoding: EncodingMethod;
  uniqueValues?: string[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: string | number;
  customValue?: string | number;
}

export interface ProcessedData {
  originalData: any[][];
  headers: string[];
  processedData: any[][];
  columnStats: ColumnStats[];
  encodingMappings: Record<string, Record<string, number>>;
}
