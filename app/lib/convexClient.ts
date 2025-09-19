import { api } from '@convex/_generated/api';
import type { FunctionReference } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

type ProcessDataFileArgs = {
  storageId: Id<'_storage'>;
  fileName: string;
  fileType: string;
  fileSize?: number;
  companyId?: string;
  sessionId?: Id<'sessions'>;
  sampleSize?: number;
  detectTypes?: boolean;
  findCorrelations?: boolean;
};

type ProcessDataFileResult = {
  success: boolean;
  dataFileId?: Id<'dataFiles'>;
  headers?: string[];
  rowCount?: number;
  analysis?: unknown;
  correlations?: unknown;
  sampleData?: unknown[];
  error?: string;
};

type ProcessUploadedDocumentArgs = {
  storageId: Id<'_storage'>;
  fileName: string;
  fileType: string;
  fileSize?: number;
  companyId?: string;
  sessionId?: Id<'sessions'>;
  extractStructure?: boolean;
  generateEmbedding?: boolean;
};

type ProcessUploadedDocumentResult = {
  success: boolean;
  documentId?: Id<'uploadedDocuments'>;
  extractedText?: string;
  structure?: unknown;
  metadata?: unknown;
  error?: string;
};

type ProcessingStatus = {
  status: string;
  progress: number;
  currentStep: string;
  error: string | null;
  startTime: number;
  endTime: number | null;
} | null;

type DataProcessingModule = {
  processDataFile: FunctionReference<'action', 'public', ProcessDataFileArgs, ProcessDataFileResult>;
};

type DocumentProcessingModule = {
  processUploadedDocument: FunctionReference<
    'action',
    'public',
    ProcessUploadedDocumentArgs,
    ProcessUploadedDocumentResult
  >;
};

type DataFilesQueryModule = {
  getProcessingStatus: FunctionReference<'query', 'public', { dataFileId: Id<'dataFiles'> }, ProcessingStatus>;
};

type UploadedDocumentsQueryModule = {
  getProcessingStatus: FunctionReference<'query', 'public', { documentId: Id<'uploadedDocuments'> }, ProcessingStatus>;
};

export const convexApi = api as typeof api &
  Record<'actions/dataProcessing', DataProcessingModule> &
  Record<'actions/documentProcessing', DocumentProcessingModule> &
  Record<'queries/dataFiles', DataFilesQueryModule> &
  Record<'queries/uploadedDocuments', UploadedDocumentsQueryModule>;
