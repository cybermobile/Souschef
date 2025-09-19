import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAction, useMutation } from 'convex/react';
import type { Id } from '@convex/_generated/dataModel';
import { convexApi } from '~/lib/convexClient';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { useChefAuth } from '~/components/chat/ChefAuthWrapper';
import { formatFileSize } from '~/lib/utils/fileSize';

interface DataUploaderProps {
  companyId?: string;
  sessionId?: Id<'sessions'>;
  onUploadComplete: (dataFileId: Id<'dataFiles'>) => void;
  onUploadError?: (error: string) => void;
  onDataPreview?: (preview: DataPreview) => void;
  maxSize?: number;
  className?: string;
}

interface DataPreview {
  fileName: string;
  fileType: string;
  headers: string[];
  sampleRows: any[][];
  totalRows: number;
  columnTypes: { [key: string]: string };
}

export const DataUploader: React.FC<DataUploaderProps> = ({
  companyId,
  sessionId,
  onUploadComplete,
  onUploadError,
  onDataPreview,
  maxSize = 100 * 1024 * 1024, // 100MB default for data files
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const authState = useChefAuth();
  const sessionIdToUse = useMemo(() => {
    if (sessionId) {
      return sessionId;
    }
    return authState.kind === 'fullyLoggedIn' ? authState.sessionId : undefined;
  }, [authState, sessionId]);

  const generateUploadUrl = useMutation(convexApi.mutations.storage.generateUploadUrl);
  const processDataFile = useAction(convexApi['actions/dataProcessing'].processDataFile);

  const detectColumnType = (values: any[]): string => {
    const nonEmptyValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    if (nonEmptyValues.length === 0) {
      return 'string';
    }

    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;

    for (const value of nonEmptyValues.slice(0, 10)) {
      // Sample first 10 values
      const strValue = String(value).toLowerCase().trim();

      // Check boolean
      if (['true', 'false', 'yes', 'no', '1', '0'].includes(strValue)) {
        booleanCount++;
      }
      // Check number
      else if (!isNaN(Number(strValue)) && strValue !== '') {
        numberCount++;
      }
      // Check date
      else if (!isNaN(Date.parse(strValue))) {
        dateCount++;
      }
    }

    const total = nonEmptyValues.length;
    if (booleanCount / total > 0.8) {
      return 'boolean';
    }
    if (numberCount / total > 0.8) {
      return 'number';
    }
    if (dateCount / total > 0.8) {
      return 'date';
    }
    return 'string';
  };

  const parseCSV = (file: File): Promise<DataPreview> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const headers = results.meta.fields || [];
            const rows = results.data as any[];

            // Analyze column types
            const columnTypes: { [key: string]: string } = {};
            headers.forEach((header) => {
              const columnValues = rows.map((row) => row[header]);
              columnTypes[header] = detectColumnType(columnValues);
            });

            const preview: DataPreview = {
              fileName: file.name,
              fileType: 'csv',
              headers,
              sampleRows: rows.slice(0, 5).map((row) => headers.map((h) => row[h])),
              totalRows: rows.length,
              columnTypes,
            };

            resolve(preview);
          } catch (error) {
            reject(new Error('Failed to parse CSV file'));
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  };

  const parseExcel = (file: File): Promise<DataPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Use first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonData.length === 0) {
            reject(new Error('Excel file appears to be empty'));
            return;
          }

          const headers = jsonData[0].map((h) => String(h || ''));
          const dataRows = jsonData
            .slice(1)
            .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ''));

          // Analyze column types
          const columnTypes: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            const columnValues = dataRows.map((row) => row[index]);
            columnTypes[header] = detectColumnType(columnValues);
          });

          const preview: DataPreview = {
            fileName: file.name,
            fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
            headers,
            sampleRows: dataRows.slice(0, 5),
            totalRows: dataRows.length,
            columnTypes,
          };

          resolve(preview);
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const resolveServerFileType = (preview: DataPreview, file: File): string => {
    if (preview.fileType === 'csv') {
      return 'text/csv';
    }
    if (preview.fileType === 'xlsx') {
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    if (preview.fileType === 'xls') {
      return 'application/vnd.ms-excel';
    }
    return file.type || 'application/octet-stream';
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      setUploading(true);
      setProgress(0);
      setDataPreview(null);
      setCurrentFile(file);

      try {
        // Step 1: Parse and analyze the file
        setProcessingStep('Parsing file...');
        setProgress(20);

        let preview: DataPreview;
        if (file.name.toLowerCase().endsWith('.csv')) {
          preview = await parseCSV(file);
        } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
          preview = await parseExcel(file);
        } else {
          throw new Error('Unsupported file format');
        }

        setProgress(50);
        setDataPreview(preview);
        onDataPreview?.(preview);

        // Step 2: Upload to Convex
        setProcessingStep('Uploading to server...');
        setProgress(70);

        const { uploadUrl } = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload data file');
        }

        const { storageId } = (await uploadResponse.json()) as { storageId: Id<'_storage'> };

        setProcessingStep('Analyzing data...');
        setProgress(85);

        const result = await processDataFile({
          storageId,
          fileName: file.name,
          fileType: resolveServerFileType(preview, file),
          fileSize: file.size,
          companyId,
          sessionId: sessionIdToUse,
          detectTypes: true,
          findCorrelations: true,
        });

        if (!result?.success || !result.dataFileId) {
          throw new Error(result?.error || 'Data processing failed');
        }

        setProgress(100);
        setProcessingStep('Complete!');
        onUploadComplete(result.dataFileId);
      } catch (error) {
        console.error('Data upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        onUploadError?.(errorMessage);
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setProcessingStep('');
          setCurrentFile(null);
        }, 2000);
      }
    },
    [
      companyId,
      sessionIdToUse,
      onUploadComplete,
      onUploadError,
      onDataPreview,
      generateUploadUrl,
      processDataFile,
    ],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxSize,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
          ${isDragActive ? 'scale-102 border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}
          ${fileRejections.length > 0 ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="size-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{processingStep}</p>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(progress)}% complete</span>
                {currentFile && <span>{formatFileSize(currentFile.size)}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto size-16 text-gray-400">
              {isDragActive ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-green-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your data file here' : 'Upload data for visualization'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isDragActive ? 'Release to analyze' : 'Drag and drop or click to select'}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Supports: CSV, Excel (.xlsx, .xls) (max {formatFileSize(maxSize)})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {dataPreview && !uploading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">Data Preview</h3>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">File:</span> {dataPreview.fileName}
            </div>
            <div>
              <span className="text-gray-500">Rows:</span> {dataPreview.totalRows.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  {dataPreview.headers.map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                      <div>
                        {header}
                        <div className="font-normal text-gray-400">({dataPreview.columnTypes[header]})</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataPreview.sampleRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-gray-600">
                        {String(cell || '').substring(0, 50)}
                        {String(cell || '').length > 50 && '...'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex">
            <svg className="size-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <div className="mt-1 text-sm text-red-700">
                {fileRejections.map(({ file, errors }) => (
                  <div key={file.name}>
                    <strong>{file.name}</strong>: {errors.map((e) => e.message).join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
