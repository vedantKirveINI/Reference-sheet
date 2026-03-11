import { useState, useCallback, DragEvent, useRef, useEffect } from 'react';
import { Upload, FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onJsonImport: (json: unknown) => void;
  onCsvImport: (csvText: string) => void;
  onImportError?: (error: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function DropZone({ onJsonImport, onCsvImport, onImportError, children, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileType, setFileType] = useState<'json' | 'csv' | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current !== null) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const items = e.dataTransfer.items;
    if (items.length > 0) {
      const item = items[0];
      if (item.type === 'application/json' || item.type === 'text/json') {
        setFileType('json');
      } else if (item.type === 'text/csv') {
        setFileType('csv');
      } else {
        setFileType(null);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
      setFileType(null);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileType(null);
    setImportError(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        try {
          const json = JSON.parse(content);
          onJsonImport(json);
          setImportError(null);
        } catch (err) {
          const errorMessage = `Failed to parse JSON: ${err instanceof Error ? err.message : 'Invalid JSON format'}`;
          setImportError(errorMessage);
          onImportError?.(errorMessage);
          if (errorTimeoutRef.current !== null) {
            clearTimeout(errorTimeoutRef.current);
          }
          errorTimeoutRef.current = window.setTimeout(() => setImportError(null), 5000);
        }
      } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        try {
          onCsvImport(content);
          setImportError(null);
        } catch (err) {
          const errorMessage = `Failed to parse CSV: ${err instanceof Error ? err.message : 'Invalid CSV format'}`;
          setImportError(errorMessage);
          onImportError?.(errorMessage);
          if (errorTimeoutRef.current !== null) {
            clearTimeout(errorTimeoutRef.current);
          }
          errorTimeoutRef.current = window.setTimeout(() => setImportError(null), 5000);
        }
      } else {
        const errorMessage = 'Unsupported file type. Please use JSON or CSV files.';
        setImportError(errorMessage);
        onImportError?.(errorMessage);
        if (errorTimeoutRef.current !== null) {
          clearTimeout(errorTimeoutRef.current);
        }
        errorTimeoutRef.current = window.setTimeout(() => setImportError(null), 5000);
      }
    };

    reader.onerror = () => {
      const errorMessage = 'Failed to read file. Please try again.';
      setImportError(errorMessage);
      onImportError?.(errorMessage);
      if (errorTimeoutRef.current !== null) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = window.setTimeout(() => setImportError(null), 5000);
    };

    reader.readAsText(file);
  }, [onJsonImport, onCsvImport, onImportError]);

  return (
    <div
      className={cn('relative', className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 border-2 border-dashed border-primary rounded-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {fileType === 'json' ? (
                <FileJson className="w-8 h-8 text-primary" />
              ) : fileType === 'csv' ? (
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {fileType === 'json' ? 'Import JSON' : fileType === 'csv' ? 'Import CSV' : 'Drop file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                {fileType === 'json' 
                  ? 'Release to import JSON structure' 
                  : fileType === 'csv' 
                  ? 'Release to import CSV data' 
                  : 'Supports JSON and CSV files'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {importError && (
        <div className="absolute bottom-4 left-4 right-4 z-50 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{importError}</span>
        </div>
      )}
    </div>
  );
}

