import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ColumnStats } from '@/types/data';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface DataSummaryProps {
  columnStats: ColumnStats[];
  dataRows: number;
}

const DataSummary: React.FC<DataSummaryProps> = ({ columnStats, dataRows }) => {
  const totalMissingValues = columnStats.reduce((sum, col) => sum + col.missingCount, 0);
  const columnsWithMissing = columnStats.filter(col => col.missingCount > 0);
  const categoricalColumns = columnStats.filter(col => col.dataType === 'categorical');
  const numericColumns = columnStats.filter(col => col.dataType === 'numeric');
  const missingPercentage = ((totalMissingValues / (dataRows * columnStats.length)) * 100).toFixed(2);

  // Detect outliers using IQR
  const detectOutliers = (col: ColumnStats) => {
    if (!col.data || col.dataType !== 'numeric') return 0;
    const sorted = [...col.data].sort((a, b) => a - b);
    const Q1 = sorted[Math.floor(sorted.length * 0.25)];
    const Q3 = sorted[Math.floor(sorted.length * 0.75)];
    const IQR = Q3 - Q1;
    const lowerBound = Q1 - 1.5 * IQR;
    const upperBound = Q3 + 1.5 * IQR;
    return col.data.filter(value => value < lowerBound || value > upperBound).length;
  };

  const outlierColumns = numericColumns.filter(col => detectOutliers(col) > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Data Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="font-medium text-sm text-gray-500">Total Rows</div>
          <div className="text-2xl font-bold">{dataRows}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="font-medium text-sm text-gray-500">Total Columns</div>
          <div className="text-2xl font-bold">{columnStats.length}</div>
        </div>
        <div className={`bg-white p-4 rounded-lg shadow ${totalMissingValues > 0 ? 'border-l-4 border-data-missing' : ''}`}>
          <div className="font-medium text-sm text-gray-500">Missing Values</div>
          <div className="text-2xl font-bold">{totalMissingValues} ({missingPercentage}%)</div>
        </div>
      </div>

      {totalMissingValues > 0 ? (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Data Detected</AlertTitle>
          <AlertDescription>
            {columnsWithMissing.length} column{columnsWithMissing.length !== 1 ? 's' : ''} contain{columnsWithMissing.length === 1 ? 's' : ''} missing values. 
            Use the options below to select imputation methods.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>No Missing Data</AlertTitle>
          <AlertDescription>
            Your dataset doesn't have any missing values.
          </AlertDescription>
        </Alert>
      )}

      {outlierColumns.length === 0 ? (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>No Outliers Detected</AlertTitle>
          <AlertDescription>
            No outliers were detected in the numeric columns.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Outliers Detected</AlertTitle>
          <AlertDescription>
            {outlierColumns.length} column{outlierColumns.length !== 1 ? 's' : ''} contain{outlierColumns.length === 1 ? 's' : ''} outliers. 
            Consider handling them before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {categoricalColumns.length > 0 && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Categorical Data Found</AlertTitle>
          <AlertDescription>
            {categoricalColumns.length} categorical column{categoricalColumns.length !== 1 ? 's' : ''} detected. 
            You can encode these columns using the options below.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DataSummary;