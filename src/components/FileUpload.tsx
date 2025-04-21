
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File is too large. Please upload a file smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content);
      toast.success(`File "${file.name}" loaded successfully`);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-data-highlight bg-blue-50' : 'border-gray-300 hover:border-data-highlight'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="h-12 w-12 text-gray-400" />
        <div>
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium">Drag & drop a CSV file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">Only CSV files are supported (max 5MB)</p>
            </div>
          )}
        </div>
        <Button variant="default" className="mt-4 bg-data-highlight hover:bg-data-highlight/90">
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
