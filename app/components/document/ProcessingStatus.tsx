import React from 'react';
import { useQuery } from 'convex/react';

interface ProcessingStatusProps {
  documentId?: string;
  dataFileId?: string;
  showDetails?: boolean;
  className?: string;
}

interface ProcessingState {
  status: 'uploaded' | 'extracting' | 'analyzing' | 'embedding' | 'matching' | 'rewriting' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
  startTime?: number;
  estimatedTimeRemaining?: number;
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
};

// Mock data for development - replace with actual Convex query
const useMockProcessingStatus = (id?: string): ProcessingState | null => {
  if (!id) {
    return null;
  }

  // This would be replaced with actual Convex queries:
  // const documentStatus = useQuery(api.documents.getProcessingStatus, { documentId });
  // const dataFileStatus = useQuery(api.dataFiles.getProcessingStatus, { dataFileId });

  // Mock processing state for demonstration
  return {
    status: 'matching',
    progress: 65,
    currentStep: 'Analyzing document structure and finding matching templates...',
    startTime: Date.now() - 30000, // Started 30 seconds ago
    estimatedTimeRemaining: 15000, // 15 seconds remaining
  };
};

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  documentId,
  dataFileId,
  showDetails = true,
  className = '',
}) => {
  const processingState = useMockProcessingStatus(documentId || dataFileId);

  if (!processingState) {
    return null;
  }

  const config = statusConfig[processingState.status];
  const isProcessing = !['completed', 'failed'].includes(processingState.status);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
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
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-500">
              {processingState.status === 'failed' && processingState.error
                ? processingState.error
                : processingState.currentStep}
            </p>
          </div>
        </div>

        {/* Status indicator */}
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

      {/* Progress bar */}
      {isProcessing && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{processingState.progress}%</span>
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

      {/* Detailed steps */}
      {showDetails && (
        <div className="space-y-3">
          {getProcessingSteps().map((step, index) => (
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

      {/* Timing information */}
      {(processingState.startTime || processingState.estimatedTimeRemaining) && (
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          {processingState.startTime && <span>Running for {formatTime(Date.now() - processingState.startTime)}</span>}
          {processingState.estimatedTimeRemaining && isProcessing && (
            <span>~{formatTime(processingState.estimatedTimeRemaining)} remaining</span>
          )}
        </div>
      )}

      {/* Error details */}
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

      {/* Success actions */}
      {processingState.status === 'completed' && (
        <div className="mt-4 flex space-x-3">
          <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            View Results
          </button>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Download
          </button>
        </div>
      )}
    </div>
  );
};
