
import React, { useState, useMemo } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileSpreadsheet, WandSparkles, Download } from "lucide-react";

import { 
  parseCSV, 
  processData, 
  imputeData, 
  encodeData, 
  dataToCSV,
  mappingsToCSV,
  mappingsToJSON
} from "../utils/dataProcessing";
import { ColumnStats, ImputationMethod, EncodingMethod, ProcessedData } from "../types/data";
import FileUpload from "../components/FileUpload";
import DataSummary from "../components/DataSummary";
import DataTable from "../components/DataTable";
import ColumnSettings from "../components/ColumnSettings";
import DownloadOptions from "../components/DownloadOptions";

const Index = () => {
  const [fileName, setFileName] = useState<string>('');
  const [rawData, setRawData] = useState<string[][] | null>(null);
  const [processedDataState, setProcessedDataState] = useState<ProcessedData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isProcessed, setIsProcessed] = useState<boolean>(false);

  // Handle file upload
  const handleFileLoaded = (content: string) => {
    try {
      const csvData = parseCSV(content);
      if (csvData.length < 2) {
        toast.error("CSV file must contain at least a header row and one data row");
        return;
      }

      setRawData(csvData);
      const processed = processData(csvData);
      setProcessedDataState(processed);
      setActiveTab('analyze');
    } catch (error) {
      toast.error(`Error processing CSV: ${(error as Error).message}`);
    }
  };

  // Calculate missing cells for display in the data table
  const missingCells = useMemo(() => {
    if (!rawData) return [];
    
    const cells = [];
    const headers = rawData[0];
    const data = rawData.slice(1);
    
    for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = row[colIdx];
        if (cellValue === "" || cellValue === null || cellValue === undefined) {
          cells.push({ row: rowIdx, col: colIdx });
        }
      }
    }
    
    return cells;
  }, [rawData]);

  // Handle imputation method change
  const handleImputationChange = (columnName: string, method: ImputationMethod) => {
    if (!processedDataState) return;
    
    setProcessedDataState(prevState => {
      if (!prevState) return null;
      
      const updatedColumns = prevState.columnStats.map(col => {
        if (col.name === columnName) {
          return { ...col, selectedImputation: method };
        }
        return col;
      });
      
      return { ...prevState, columnStats: updatedColumns };
    });
  };

  // Handle custom value change for imputation
  const handleCustomValueChange = (columnName: string, value: string) => {
    if (!processedDataState) return;
    
    setProcessedDataState(prevState => {
      if (!prevState) return null;
      
      const updatedColumns = prevState.columnStats.map(col => {
        if (col.name === columnName) {
          return { ...col, customValue: value };
        }
        return col;
      });
      
      return { ...prevState, columnStats: updatedColumns };
    });
  };

  // Handle encoding method change
  const handleEncodingChange = (columnName: string, method: EncodingMethod) => {
    if (!processedDataState) return;
    
    setProcessedDataState(prevState => {
      if (!prevState) return null;
      
      const updatedColumns = prevState.columnStats.map(col => {
        if (col.name === columnName) {
          return { ...col, selectedEncoding: method };
        }
        return col;
      });
      
      return { ...prevState, columnStats: updatedColumns };
    });
  };

  // Process data with selected imputation and encoding methods
  const handleProcessData = () => {
    if (!processedDataState) return;
    
    try {
      const imputedData = imputeData(processedDataState);
      const encodedData = encodeData(imputedData);
      setProcessedDataState(encodedData);
      setIsProcessed(true);
      setActiveTab('preview');
      toast.success("Data processed successfully!");
    } catch (error) {
      toast.error(`Error processing data: ${(error as Error).message}`);
    }
  };

  // Auto-suggest imputation and encoding methods
  const handleAutoSuggest = () => {
    if (!processedDataState) return;
    
    setProcessedDataState(prevState => {
      if (!prevState) return null;
      
      const updatedColumns = prevState.columnStats.map(col => {
        return { 
          ...col, 
          selectedImputation: col.suggestedImputation,
          selectedEncoding: col.suggestedEncoding 
        };
      });
      
      return { ...prevState, columnStats: updatedColumns };
    });
    
    toast.success("Auto-suggestions applied!");
  };

  // Prepare download data
  const downloadData = useMemo(() => {
    if (!processedDataState || !isProcessed) {
      return {
        processedCsv: '',
        mappingsCsv: '',
        mappingsJson: ''
      };
    }
    
    const { processedData, headers, encodingMappings } = processedDataState;
    
    return {
      processedCsv: dataToCSV(processedData, headers),
      mappingsCsv: mappingsToCSV(encodingMappings),
      mappingsJson: mappingsToJSON(encodingMappings)
    };
  }, [processedDataState, isProcessed]);
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Data Whisperer</h1>
        <p className="text-lg text-gray-600 mt-2">Handle missing data and encode categorical features with ease</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled={activeTab === 'upload' && !rawData}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Upload Data
          </TabsTrigger>
          <TabsTrigger value="analyze" disabled={!rawData}>
            <WandSparkles className="mr-2 h-4 w-4" />
            Analyze & Clean
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!isProcessed}>
            <Download className="mr-2 h-4 w-4" />
            Preview & Download
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="p-4 border rounded-lg">
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Upload Your Dataset</h2>
              <p className="text-gray-600">
                Upload a CSV file to get started. The file should have a header row and be less than 5MB in size.
              </p>
            </div>
            
            <FileUpload onFileLoaded={(content) => handleFileLoaded(content)} />
            
            {rawData && (
              <div className="flex justify-center">
                <Button onClick={() => setActiveTab('analyze')}>
                  Continue to Analysis
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analyze" className="space-y-8">
          {processedDataState && rawData && (
            <>
              <DataSummary 
                columnStats={processedDataState.columnStats} 
                dataRows={rawData.length - 1} 
              />
              
              <div className="mt-8 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Data Preview</h2>
                  <Button variant="outline" onClick={handleAutoSuggest}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Apply Suggestions
                  </Button>
                </div>
                <DataTable 
                  headers={processedDataState.headers} 
                  data={processedDataState.originalData} 
                  missingCells={missingCells}
                />
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Column Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedDataState.columnStats.map((column, idx) => (
                    <ColumnSettings
                      key={idx}
                      column={column}
                      onImputationChange={handleImputationChange}
                      onCustomValueChange={handleCustomValueChange}
                      onEncodingChange={handleEncodingChange}
                    />
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleProcessData}
                  className="bg-data-highlight hover:bg-data-highlight/90"
                  size="lg"
                >
                  <WandSparkles className="mr-2 h-5 w-5" />
                  Process Data
                </Button>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-8">
          {processedDataState && isProcessed && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-center">
                <h3 className="font-medium">Data Processing Complete!</h3>
                <p>Your data has been processed according to your specifications.</p>
              </div>
              
              <div className="mt-8 mb-4">
                <h2 className="text-2xl font-bold mb-4">Processed Data Preview</h2>
                <DataTable 
                  headers={processedDataState.headers} 
                  data={processedDataState.processedData}
                  previewMode={true}
                />
              </div>
              
              <Separator className="my-6" />
              
              <DownloadOptions
                processedCsv={downloadData.processedCsv}
                mappingsCsv={downloadData.mappingsCsv}
                mappingsJson={downloadData.mappingsJson}
                originalFilename={fileName}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
