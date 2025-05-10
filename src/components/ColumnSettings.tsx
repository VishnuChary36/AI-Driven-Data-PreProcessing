import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { ColumnStats, ImputationMethod, EncodingMethod } from '@/types/data';
import { Badge } from '@/components/ui/badge';

interface ColumnSettingsProps {
  column: ColumnStats;
  onImputationChange: (columnName: string, method: ImputationMethod) => void;
  onCustomValueChange: (columnName: string, value: string) => void;
  onEncodingChange: (columnName: string, method: EncodingMethod) => void;
}

const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  column,
  onImputationChange,
  onCustomValueChange,
  onEncodingChange
}) => {
  const showCustomInput = column.selectedImputation === 'custom';
  
  let dataTypeBadge;
  switch (column.dataType) {
    case 'numeric':
      dataTypeBadge = <Badge className="bg-blue-500">Numeric</Badge>;
      break;
    case 'categorical':
      dataTypeBadge = <Badge className="bg-purple-500">Categorical</Badge>;
      break;
    default:
      dataTypeBadge = <Badge className="bg-gray-500">Unknown</Badge>;
  }

  // Suggest encoding method based on skewness
  const suggestEncodingMethod = () => {
    if (column.dataType === 'numeric') {
      const skewness = column.skewness || 0; // Assume skewness is provided in ColumnStats
      return Math.abs(skewness) < 0.5 ? 'Min-Max Scaling' : 'Standardization';
    }
    return 'None';
  };

  // Suggest imputation method based on data type and missing values
  const suggestImputationMethod = () => {
    if (column.dataType === 'numeric') {
      if (column.missingCount > 0) {
        return column.missingCount > 10 ? 'Mean' : 'Median';
      }
    } else if (column.dataType === 'categorical') {
      return column.mode ? `Mode (${column.mode})` : 'None';
    }
    return 'None';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md">{column.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {dataTypeBadge}
              {column.missingCount > 0 && (
                <Badge variant="destructive" className="bg-data-missing">
                  {column.missingCount} missing ({column.missingPercentage.toFixed(1)}%)
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {column.missingCount > 0 && (
          <div className="space-y-4">
            <div>
              <label htmlFor={`imputation-${column.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                Imputation Method (Suggested: {suggestImputationMethod()})
              </label>
              <Select 
                value={column.selectedImputation} 
                onValueChange={(value) => onImputationChange(column.name, value as ImputationMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (keep missing)</SelectItem>
                  {column.dataType === 'numeric' && (
                    <>
                      <SelectItem value="mean">Mean ({column.mean?.toFixed(2) || 'N/A'})</SelectItem>
                      <SelectItem value="median">Median ({column.median?.toFixed(2) || 'N/A'})</SelectItem>
                    </>
                  )}
                  {column.dataType === 'categorical' && (
                    <SelectItem value="mode">Mode ({column.mode || 'N/A'})</SelectItem>
                  )}
                  <SelectItem value="custom">Custom Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showCustomInput && (
              <div>
                <label htmlFor={`custom-${column.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Value
                </label>
                <Input
                  id={`custom-${column.name}`}
                  value={column.customValue || ""}
                  onChange={(e) => onCustomValueChange(column.name, e.target.value)}
                  placeholder="Enter custom value"
                />
              </div>
            )}
          </div>
        )}
        
        {column.dataType === 'categorical' && (
          <div className="mt-4">
            <label htmlFor={`encoding-${column.name}`} className="block text-sm font-medium text-gray-700 mb-1">
              Encoding Method
            </label>
            <Select 
              value={column.selectedEncoding} 
              onValueChange={(value) => onEncodingChange(column.name, value as EncodingMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select encoding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="label">Label Encoding</SelectItem>
                {/* One-hot encoding would be added in a future version */}
                {/* <SelectItem value="one-hot">One-Hot Encoding</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        )}

        {column.dataType === 'numeric' && (
          <div className="mt-4">
            <label htmlFor={`encoding-${column.name}`} className="block text-sm font-medium text-gray-700 mb-1">
              Encoding Method (Suggested: {suggestEncodingMethod()})
            </label>
            <Select 
              value={column.selectedEncoding} 
              onValueChange={(value) => onEncodingChange(column.name, value as EncodingMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select encoding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="min-max">Min-Max Scaling</SelectItem>
                <SelectItem value="standardization">Standardization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      {column.dataType === 'categorical' && column.uniqueValues && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <p className="text-sm text-gray-500 mb-2">
              Unique Values: {column.uniqueValues.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {column.uniqueValues.slice(0, 5).map((val, i) => (
                <Badge key={i} variant="outline" className="bg-gray-100">
                  {val}
                </Badge>
              ))}
              {column.uniqueValues.length > 5 && (
                <Badge variant="outline" className="bg-gray-100">
                  +{column.uniqueValues.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ColumnSettings;