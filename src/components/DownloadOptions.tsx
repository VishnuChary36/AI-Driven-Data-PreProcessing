
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadOptionsProps {
  processedCsv: string;
  mappingsCsv: string;
  mappingsJson: string;
  originalFilename?: string;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  processedCsv,
  mappingsCsv,
  mappingsJson,
  originalFilename = 'data'
}) => {
  const baseFilename = originalFilename.replace(/\.csv$/i, '');
  
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${filename}`);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Download Processed Data</h3>
      
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => handleDownload(processedCsv, `${baseFilename}_processed.csv`)}
          className="bg-data-highlight hover:bg-data-highlight/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Processed CSV
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Encoding Mappings
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload(mappingsCsv, `${baseFilename}_mappings.csv`)}>
              Download as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(mappingsJson, `${baseFilename}_mappings.json`)}>
              Download as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DownloadOptions;
