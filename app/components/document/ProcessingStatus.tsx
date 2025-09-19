import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import type { Id } from '@convex/_generated/dataModel';
import { convexApi } from '~/lib/convexClient';

interface ProcessingStatusProps {
  documentId?: Id<'uploadedDocuments'>;
  dataFileId?: Id<'dataFiles'>;
  showDetails?: boolean;
  className?: string;
}

const statusConfig = {
  uploaded: { label: 'Uploaded', color: 'blue', icon: '📄' },
  extracting: { label: 'Extracting Content', color: 'yellow', icon: '🔍' },
  analyzing: { label: 'Analyzing Structure', color: 'yellow', icon: '📋' },
  embedding: { label: 'Generating Embeddings', color: 'yellow', icon: '🧠' },
  matching: { label: 'Finding Templates', color: 'yellow', icon: '🎯' },
  rewriting: { label: 'Applying Template', color: 'yellow', icon: '✍️' },
  completed: { label: 'Complete', color: 'green', icon: '✅' },
  failed: { label: 'Failed', color: 'red', icon: '❌' },
} as const;

type StatusKey = keyof typeof statusConfig;

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  documentId,
  dataFileId,
  showDetails = true,
  className = '',
}) => {
  const documentStatus = useQuery(
    convexApi['queries/uploadedDocuments'].getProcessingStatus,
    documentId ? { documentId } : 'skip',
  );
  const dataFileStatus = useQuery(
    convexApi['queries/dataFiles'].getProcessingStatus,
    dataFileId ? { dataFileId } : 'skip',
  );

  const processingState = useMemo(() => {
    const status = documentId ? documentStatus : dataFileStatus;
    if (!status) {
      return null;
    }

    const statusKey = (status.status as StatusKey) ?? 'uploaded';
    const currentStepText = (() => {
      switch (statusKey) {
        case 'extracting':
          return 'Extracting content from the uploaded file...';
        case 'analyzing':
          return 'Analyzing structure and content...';
        case 'embedding':
          return 'Generating embeddings for search...';
        case 'matching':
          return 'Matching against templates and past documents...';
        case 'rewriting':
          return 'Applying template instructions...';
        case 'completed':
          return 'Processing complete';
        case 'failed':
          return status.error ?? 'Processing failed';
        default:
          return 'Queued for processing';
      }
    })();

    return {
      status: statusKey,
      progress: status.progress ?? 0,
      currentStep: currentStepText,
      error: status.error ?? undefined,
      startTime: status.startTime ?? undefined,
      endTime: status.endTime ?? undefined,
    };
  }, [documentId, documentStatus, dataFileId, dataFileStatus]);

  if (!processingState) {
    return null;
  }

  const config = statusConfig[processingState.status];
  const isProcessing = !['completed', 'failed'].includes(processingState.status);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProcessingSteps = () => {
    const steps = [
      { key: 'uploaded', label: 'File Uploaded' },
      { key: 'extracting', label: 'Extract Content' },
      { key: 'analyzing', label: 'Analyze Structure' },
      { key: 'embedding', label: 'Generate Embeddings' },
      { key: 'matching', label: 'Find Templates' },
      { key: 'completed', label: 'Complete' },
    ];

    const currentIndex = steps.findIndex((step) => step.key === processingState.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
      pending: index > currentIndex,
    }));
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-500">{processingState.currentStep}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isProcessing && <div className="size-4 animate-spin rounded-full border-b-2 border-gray-600"></div>}
          <span
            className={`
              inline-flex rounded-full px-2 py-1 text-xs font-medium
              ${config.color === 'green' ? 'bg-green-100 text-green-800' : ''}
              ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${config.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
              ${config.color === 'red' ? 'bg-red-100 text-red-800' : ''}
            `}
          >
            {config.label}
          </span>
        </div>
      </div>

      {isProcessing && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{Math.round(processingState.progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`
                h-2 rounded-full transition-all duration-500
                ${config.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'}
              `}
              style={{ width: `${processingState.progress}%` }}
            >
              <div className="h-full animate-pulse rounded-full bg-white opacity-30"></div>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="space-y-3">
          {getProcessingSteps().map((step) => (
            <div key={step.key} className="flex items-center space-x-3">
              <div className="shrink-0">
                {step.completed ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
                    <svg className="size-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : step.current ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-blue-100">
                    <div className="size-2 animate-pulse rounded-full bg-blue-600"></div>
                  </div>
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-full bg-gray-100">
                    <div className="size-2 rounded-full bg-gray-400"></div>
                  </div>
                )}
              </div>
              <span
                className={`
                  text-sm
                  ${step.completed ? 'text-gray-900 line-through' : ''}
                  ${step.current ? 'font-medium text-blue-600' : ''}
                  ${step.pending ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {(processingState.startTime || processingState.endTime) && (
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          {processingState.startTime && <span>Running for {formatTime(Date.now() - processingState.startTime)}</span>}
          {processingState.endTime && !isProcessing && processingState.startTime && (
            <span>Completed in {formatTime(processingState.endTime - processingState.startTime)}</span>
          )}
        </div>
      )}

      {processingState.status === 'failed' && processingState.error && (
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
              <h4 className="text-sm font-medium text-red-800">Processing Failed</h4>
              <p className="mt-1 text-sm text-red-700">{processingState.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
