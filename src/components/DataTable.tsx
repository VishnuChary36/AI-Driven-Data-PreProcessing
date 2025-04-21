
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  headers: string[];
  data: any[][];
  missingCells?: { row: number; col: number }[];
  previewMode?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ headers, data, missingCells = [], previewMode = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const rowsPerPage = 10;
  const missingCellsMap = new Map(missingCells.map(cell => [`${cell.row}-${cell.col}`, true]));
  
  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter(row => 
        row.some(cell => 
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;
    
  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, filteredData.length);
  const currentData = filteredData.slice(startIdx, endIdx);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {startIdx + 1} to {endIdx} of {filteredData.length} rows
        </div>
      </div>
      
      <div className="border rounded-md">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, idx) => (
                  <TableHead key={idx} className="font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row, rowIdx) => (
                  <TableRow key={rowIdx + startIdx}>
                    {row.map((cell, cellIdx) => {
                      const isMissing = !previewMode && missingCellsMap.has(`${rowIdx + startIdx}-${cellIdx}`);
                      return (
                        <TableCell 
                          key={cellIdx} 
                          className={
                            isMissing 
                              ? "bg-red-50 text-red-800"
                              : previewMode && cell !== data[rowIdx + startIdx][cellIdx]
                                ? "bg-green-50 text-green-800" 
                                : ""
                          }
                        >
                          {isMissing ? <span className="italic text-gray-400">(missing)</span> : String(cell)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center py-4 text-gray-500">
                    No data to display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
