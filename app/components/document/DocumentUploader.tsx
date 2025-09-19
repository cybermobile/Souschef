import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAction, useMutation } from 'convex/react';
import type { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

import { useChefAuth } from '~/components/chat/ChefAuthWrapper';
import { formatFileSize } from '~/lib/utils/fileSize';

interface DocumentUploaderProps {
  companyId?: string;
  sessionId?: Id<'sessions'>;
  onUploadComplete?: (documentId: Id<'uploadedDocuments'>) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  companyId,
  sessionId,
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.rtf'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const authState = useChefAuth();
  const sessionIdToUse = useMemo(() => {
    if (sessionId) {
      return sessionId;
    }
    return authState.kind === 'fullyLoggedIn' ? authState.sessionId : undefined;
  }, [authState, sessionId]);

  const generateUploadUrl = useMutation(api.mutations.storage.generateUploadUrl);
  const processDocument = useAction(api.actions.documentProcessing.processUploadedDocument);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploading(true);
      setProgress(0);
      setCurrentStep('Preparing upload...');

      try {
        setProgress(10);
        const { uploadUrl } = await generateUploadUrl();

        setCurrentStep('Uploading document...');
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload document');
        }

        const { storageId } = (await uploadResponse.json()) as { storageId: Id<'_storage'> };

        setProgress(60);
        setCurrentStep('Processing document...');

        const result = await processDocument({
          storageId,
          fileName: file.name,
          fileType: file.type || getFileTypeFromName(file.name),
          fileSize: file.size,
          companyId,
          sessionId: sessionIdToUse,
          extractStructure: true,
          generateEmbedding: true,
        });

        if (!result?.success || !result.documentId) {
          throw new Error(result?.error || 'Document processing failed');
        }

        setProgress(100);
        setCurrentStep('Complete');
        onUploadComplete?.(result.documentId);
      } catch (error) {
        console.error('Upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        onUploadError?.(errorMessage);
      } finally {
        setUploading(false);
        setTimeout(() => {
          setProgress(0);
          setUploadedFile(null);
          setCurrentStep('');
        }, 2000);
      }
    },
    [companyId, sessionIdToUse, onUploadComplete, onUploadError, generateUploadUrl, processDocument],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
    },
    maxSize,
    multiple: false,
    disabled: uploading,
  });

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      case 'txt':
        return 'text/plain';
      case 'rtf':
        return 'application/rtf';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
          ${isDragActive ? 'scale-102 border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}
          ${fileRejections.length > 0 ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="size-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Processing {uploadedFile?.name}...</p>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="relative h-3 overflow-hidden rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 animate-pulse bg-white opacity-30"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentStep}</span>
                {uploadedFile && <span>{formatFileSize(uploadedFile.size)}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto size-16 text-gray-400">
              {isDragActive ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your document here' : 'Upload a document'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isDragActive ? 'Release to upload' : 'Drag and drop or click to select'}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Supports: {acceptedTypes.join(', ')} (max {formatFileSize(maxSize)})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
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

      {/* Success state could be added here */}
    </div>
  );
};
