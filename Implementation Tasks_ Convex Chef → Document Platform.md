# Implementation Tasks: Convex Chef → Document Platform

## 🚀 Phase 1: Core Setup & Document Processing (Weeks 1-4)

### Week 1: Foundation Setup

#### Task 1.1: Repository Setup
**Estimated Time:** 4 hours
**Files to Modify:** Repository root

**Steps:**
1. Fork the Convex Chef repository
```bash
git clone https://github.com/get-convex/chef.git document-platform
cd document-platform
git remote add upstream https://github.com/get-convex/chef.git
```

2. Update package.json with new project details
```json
{
  "name": "document-platform",
  "description": "AI-powered document template and data visualization platform",
  "version": "1.0.0"
}
```

3. Create new environment variables in `.env.local`
```env
# Add to existing variables
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DOCUMENT_PROCESSING_ENABLED=true
DATA_VISUALIZATION_ENABLED=true
```

#### Task 1.2: Database Schema Creation
**Estimated Time:** 6 hours
**Files to Create:** `convex/documentTemplates.ts`, `convex/uploadedDocuments.ts`, `convex/dataFiles.ts`, `convex/generatedReports.ts`

**Create `convex/documentTemplates.ts`:**
```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const documentTemplates = defineTable({
  companyId: v.string(),
  templateName: v.string(),
  templateType: v.string(), // proposal, report, memo, contract, etc.
  description: v.optional(v.string()),
  content: v.string(), // Original template content
  extractedText: v.string(), // Clean text for embedding
  structure: v.string(), // JSON representation of document structure
  embedding: v.array(v.float64()),
  fileUrl: v.optional(v.string()), // Convex file storage URL
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  isActive: v.boolean(),
  permissions: v.array(v.string()), // roles that can use this template
  usageCount: v.number(),
  tags: v.array(v.string()),
  approvalStatus: v.string(), // draft, pending, approved, rejected
}).vectorIndex("by_content_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["companyId", "templateType", "isActive", "approvalStatus"],
});
```

**Create `convex/uploadedDocuments.ts`:**
```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const uploadedDocuments = defineTable({
  companyId: v.string(),
  userId: v.id("users"),
  sessionId: v.optional(v.id("sessions")), // Link to chat session
  fileName: v.string(),
  fileType: v.string(), // pdf, docx, txt, etc.
  fileSize: v.number(),
  fileUrl: v.string(), // Convex file storage URL
  originalContent: v.string(), // Raw extracted content
  extractedText: v.string(), // Clean text for processing
  documentStructure: v.optional(v.string()), // JSON of document structure
  embedding: v.array(v.float64()),
  processingStatus: v.string(), // uploaded, extracting, embedding, matching, rewriting, completed, failed
  processingProgress: v.number(), // 0-100
  errorMessage: v.optional(v.string()),
  
  // Template matching results
  suggestedTemplates: v.optional(v.array(v.object({
    templateId: v.id("documentTemplates"),
    similarityScore: v.number(),
    matchReason: v.string(),
  }))),
  selectedTemplateId: v.optional(v.id("documentTemplates")),
  
  // Rewriting results
  rewrittenContent: v.optional(v.string()),
  rewritingInstructions: v.optional(v.string()),
  
  uploadedAt: v.number(),
  processedAt: v.optional(v.number()),
}).vectorIndex("by_content_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["companyId", "userId", "processingStatus"],
});
```

**Create `convex/dataFiles.ts`:**
```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const dataFiles = defineTable({
  companyId: v.string(),
  userId: v.id("users"),
  sessionId: v.optional(v.id("sessions")),
  fileName: v.string(),
  fileType: v.string(), // csv, xlsx, xls, tsv
  fileSize: v.number(),
  fileUrl: v.string(),
  
  // Data structure analysis
  columnHeaders: v.array(v.string()),
  columnTypes: v.array(v.string()), // string, number, date, boolean
  rowCount: v.number(),
  dataPreview: v.string(), // JSON sample of first 10 rows
  dataStatistics: v.optional(v.string()), // JSON with min, max, avg, etc.
  
  // Schema embedding for similarity matching
  schemaDescription: v.string(), // Natural language description of data
  schemaEmbedding: v.array(v.float64()),
  
  // Chart recommendations
  suggestedCharts: v.optional(v.array(v.object({
    chartType: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
    config: v.string(), // JSON chart configuration
  }))),
  
  processingStatus: v.string(), // uploaded, parsing, analyzing, completed, failed
  processingProgress: v.number(),
  errorMessage: v.optional(v.string()),
  
  uploadedAt: v.number(),
  processedAt: v.optional(v.number()),
}).vectorIndex("by_schema_embedding", {
  vectorField: "schemaEmbedding",
  dimensions: 1536,
  filterFields: ["companyId", "userId", "processingStatus"],
});
```

**Create `convex/generatedReports.ts`:**
```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const generatedReports = defineTable({
  companyId: v.string(),
  userId: v.id("users"),
  sessionId: v.optional(v.id("sessions")),
  reportName: v.string(),
  reportType: v.string(), // document_rewrite, data_visualization, combined_report
  
  // Source references
  sourceDocumentId: v.optional(v.id("uploadedDocuments")),
  sourceDataFileId: v.optional(v.id("dataFiles")),
  templateId: v.optional(v.id("documentTemplates")),
  
  // Report content
  content: v.string(), // HTML or markdown content
  charts: v.array(v.object({
    chartId: v.string(),
    chartType: v.string(),
    title: v.string(),
    config: v.string(), // JSON chart configuration
    data: v.string(), // JSON chart data
  })),
  
  // Export options
  availableFormats: v.array(v.string()), // pdf, docx, pptx, html
  exportUrls: v.optional(v.object({
    pdf: v.optional(v.string()),
    docx: v.optional(v.string()),
    pptx: v.optional(v.string()),
    html: v.optional(v.string()),
  })),
  
  // Metadata
  generationStatus: v.string(), // generating, completed, failed
  generationProgress: v.number(),
  errorMessage: v.optional(v.string()),
  
  createdAt: v.number(),
  lastModified: v.number(),
  viewCount: v.number(),
  shareSettings: v.optional(v.object({
    isPublic: v.boolean(),
    allowedUsers: v.array(v.id("users")),
    expiresAt: v.optional(v.number()),
  })),
});
```

#### Task 1.3: Update Convex Schema
**Estimated Time:** 2 hours
**Files to Modify:** `convex/schema.ts`

**Update `convex/schema.ts`:**
```typescript
import { defineSchema } from "convex/server";
import { documentTemplates } from "./documentTemplates";
import { uploadedDocuments } from "./uploadedDocuments";
import { dataFiles } from "./dataFiles";
import { generatedReports } from "./generatedReports";
// ... existing imports

export default defineSchema({
  // ... existing tables
  documentTemplates,
  uploadedDocuments,
  dataFiles,
  generatedReports,
});
```

### Week 2: Document Processing Infrastructure

#### Task 2.1: File Upload Components
**Estimated Time:** 8 hours
**Files to Create:** `app/components/DocumentUploader.tsx`, `app/components/DataUploader.tsx`

**Create `app/components/DocumentUploader.tsx`:**
```typescript
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface DocumentUploaderProps {
  companyId: string;
  onUploadComplete: (documentId: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  companyId,
  onUploadComplete,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt'],
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadDocument = useMutation(api.documents.uploadDocument);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setProgress(0);

    try {
      // Upload file to Convex storage
      const documentId = await uploadDocument({
        companyId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      onUploadComplete(documentId);
      setProgress(100);
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [companyId, uploadDocument, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxSize,
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading document...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your document here' : 'Upload a document'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: PDF, Word, Text files (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Task 2.2: Document Processing Functions
**Estimated Time:** 10 hours
**Files to Create:** `convex/documents.ts`, `convex/documentProcessing.ts`

**Create `convex/documents.ts`:**
```typescript
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Upload document mutation
export const uploadDocument = mutation({
  args: {
    companyId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const documentId = await ctx.db.insert("uploadedDocuments", {
      companyId: args.companyId,
      userId: identity.subject as any,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      fileUrl: "", // Will be updated after file upload
      originalContent: "",
      extractedText: "",
      embedding: [],
      processingStatus: "uploaded",
      processingProgress: 0,
      uploadedAt: Date.now(),
    });

    // Schedule document processing
    await ctx.scheduler.runAfter(0, api.documentProcessing.processDocument, {
      documentId,
    });

    return documentId;
  },
});

// Get document by ID
export const getDocument = query({
  args: { documentId: v.id("uploadedDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Get documents for a company
export const getCompanyDocuments = query({
  args: { 
    companyId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("uploadedDocuments")
      .withIndex("by_content_embedding", (q) => 
        q.eq("companyId", args.companyId)
      );

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("processingStatus"), args.status));
    }

    return await query
      .order("desc")
      .take(args.limit || 50);
  },
});

// Update document processing status
export const updateProcessingStatus = mutation({
  args: {
    documentId: v.id("uploadedDocuments"),
    status: v.string(),
    progress: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      processingStatus: args.status,
      processingProgress: args.progress,
      errorMessage: args.errorMessage,
      ...(args.status === "completed" && { processedAt: Date.now() }),
    });
  },
});
```

**Create `convex/documentProcessing.ts`:**
```typescript
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";

// Main document processing action
export const processDocument = internalAction({
  args: { documentId: v.id("uploadedDocuments") },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.documents.updateProcessingStatus, {
        documentId: args.documentId,
        status: "extracting",
        progress: 10,
      });

      // Get document details
      const document = await ctx.runQuery(api.documents.getDocument, {
        documentId: args.documentId,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // Step 1: Extract text content
      const extractedText = await extractTextFromFile(document.fileUrl, document.fileType);
      
      await ctx.runMutation(api.documents.updateProcessingStatus, {
        documentId: args.documentId,
        status: "embedding",
        progress: 40,
      });

      // Step 2: Generate embedding
      const embedding = await generateEmbedding(extractedText);

      await ctx.runMutation(api.documents.updateProcessingStatus, {
        documentId: args.documentId,
        status: "matching",
        progress: 70,
      });

      // Step 3: Find similar templates
      const similarTemplates = await findSimilarTemplates(
        ctx,
        embedding,
        document.companyId
      );

      // Step 4: Update document with results
      await ctx.runMutation(api.documents.updateDocumentContent, {
        documentId: args.documentId,
        extractedText,
        embedding,
        suggestedTemplates: similarTemplates,
      });

      await ctx.runMutation(api.documents.updateProcessingStatus, {
        documentId: args.documentId,
        status: "completed",
        progress: 100,
      });

    } catch (error) {
      console.error("Document processing failed:", error);
      await ctx.runMutation(api.documents.updateProcessingStatus, {
        documentId: args.documentId,
        status: "failed",
        progress: 0,
        errorMessage: error.message,
      });
    }
  },
});

// Helper function to extract text from different file types
async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  // This would integrate with document parsing libraries
  // For now, return placeholder
  return "Extracted text content would go here";
}

// Helper function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  // This would call OpenAI embeddings API
  // For now, return placeholder array
  return new Array(1536).fill(0);
}

// Helper function to find similar templates
async function findSimilarTemplates(ctx: any, embedding: number[], companyId: string) {
  const results = await ctx.vectorSearch("documentTemplates", "by_content_embedding", {
    vector: embedding,
    limit: 5,
    filter: (q: any) => q.eq("companyId", companyId),
  });

  return results.map((result: any) => ({
    templateId: result._id,
    similarityScore: result._score,
    matchReason: `${Math.round(result._score * 100)}% content similarity`,
  }));
}
```

### Week 3: Template Management

#### Task 3.1: Template Upload & Management
**Estimated Time:** 8 hours
**Files to Create:** `app/components/TemplateManager.tsx`, `convex/templates.ts`

**Create `convex/templates.ts`:**
```typescript
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Upload template
export const uploadTemplate = mutation({
  args: {
    companyId: v.string(),
    templateName: v.string(),
    templateType: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const templateId = await ctx.db.insert("documentTemplates", {
      companyId: args.companyId,
      templateName: args.templateName,
      templateType: args.templateType,
      description: args.description,
      content: args.content,
      extractedText: args.content, // For now, assume content is text
      structure: JSON.stringify({ sections: [], formatting: {} }),
      embedding: [], // Will be generated in background
      createdBy: identity.subject as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
      permissions: ["all"], // Default permissions
      usageCount: 0,
      tags: args.tags,
      approvalStatus: "approved", // Auto-approve for now
    });

    // Schedule embedding generation
    await ctx.scheduler.runAfter(0, api.templateProcessing.generateTemplateEmbedding, {
      templateId,
    });

    return templateId;
  },
});

// Get company templates
export const getCompanyTemplates = query({
  args: { 
    companyId: v.string(),
    templateType: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("documentTemplates")
      .withIndex("by_content_embedding", (q) => 
        q.eq("companyId", args.companyId)
      );

    if (args.templateType) {
      query = query.filter((q) => q.eq(q.field("templateType"), args.templateType));
    }

    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    return await query.order("desc").collect();
  },
});

// Get template by ID
export const getTemplate = query({
  args: { templateId: v.id("documentTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

// Update template usage count
export const incrementTemplateUsage = mutation({
  args: { templateId: v.id("documentTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (template) {
      await ctx.db.patch(args.templateId, {
        usageCount: template.usageCount + 1,
      });
    }
  },
});
```

#### Task 3.2: Template Selection UI
**Estimated Time:** 6 hours
**Files to Create:** `app/components/TemplateSelector.tsx`

**Create `app/components/TemplateSelector.tsx`:**
```typescript
import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface TemplateSelectorProps {
  companyId: string;
  suggestedTemplates?: Array<{
    templateId: string;
    similarityScore: number;
    matchReason: string;
  }>;
  onTemplateSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  companyId,
  suggestedTemplates = [],
  onTemplateSelect,
  selectedTemplateId,
}) => {
  const [activeTab, setActiveTab] = useState<'suggested' | 'browse'>('suggested');
  const [selectedType, setSelectedType] = useState<string>('all');

  const allTemplates = useQuery(api.templates.getCompanyTemplates, {
    companyId,
    ...(selectedType !== 'all' && { templateType: selectedType }),
    isActive: true,
  });

  const templateTypes = ['all', 'proposal', 'report', 'memo', 'contract', 'presentation'];

  const renderTemplateCard = (template: any, suggestion?: any) => (
    <div
      key={template._id}
      className={`
        border rounded-lg p-4 cursor-pointer transition-all
        ${selectedTemplateId === template._id 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onTemplateSelect(template._id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{template.templateName}</h3>
        {suggestion && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {Math.round(suggestion.similarityScore * 100)}% match
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        {template.description || 'No description available'}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {template.templateType}
        </span>
        <span>Used {template.usageCount} times</span>
      </div>
      
      {suggestion && (
        <p className="text-xs text-green-600 mt-2">
          {suggestion.matchReason}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'suggested'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            Suggested Templates
            {suggestedTemplates.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                {suggestedTemplates.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            Browse All Templates
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'suggested' ? (
        <div className="space-y-4">
          {suggestedTemplates.length > 0 ? (
            <>
              <p className="text-sm text-gray-600">
                Based on your document content, here are the most relevant templates:
              </p>
              {suggestedTemplates.map((suggestion) => {
                const template = allTemplates?.find(t => t._id === suggestion.templateId);
                return template ? renderTemplateCard(template, suggestion) : null;
              })}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No template suggestions available yet</p>
              <p className="text-sm text-gray-400">Upload a document to get AI-powered template recommendations</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter by type */}
          <div className="flex flex-wrap gap-2">
            {templateTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${selectedType === type
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid gap-4">
            {allTemplates?.map((template) => renderTemplateCard(template))}
          </div>

          {allTemplates?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No templates found</p>
              <p className="text-sm text-gray-400">Create your first template to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Week 4: AI Document Rewriting

#### Task 4.1: Enhanced System Prompt
**Estimated Time:** 4 hours
**Files to Modify:** `chef-agent/prompts/system.ts`

This is where we need the detailed system prompt - I'll create this in the next file.

#### Task 4.2: Document Rewriting Tools
**Estimated Time:** 8 hours
**Files to Create:** `chef-agent/tools/documentRewriter.ts`, `chef-agent/tools/templateMatcher.ts`

#### Task 4.3: Rewriting Workflow Integration
**Estimated Time:** 6 hours
**Files to Modify:** `chef-agent/ChatContextManager.ts`, various chat components

---

## 📋 Task Checklist Template

For each task, use this checklist:

### Pre-Task Setup
- [ ] Create feature branch: `git checkout -b feature/task-name`
- [ ] Review existing code structure
- [ ] Identify dependencies and prerequisites

### Implementation
- [ ] Write/modify code according to specifications
- [ ] Add proper TypeScript types
- [ ] Include error handling
- [ ] Add loading states for UI components

### Testing
- [ ] Test basic functionality
- [ ] Test error scenarios
- [ ] Test with different file types/sizes
- [ ] Verify real-time updates work

### Integration
- [ ] Ensure new code integrates with existing systems
- [ ] Update related components if needed
- [ ] Test end-to-end workflows

### Documentation
- [ ] Add code comments for complex logic
- [ ] Update README if needed
- [ ] Document any new environment variables

### Deployment
- [ ] Commit changes with descriptive message
- [ ] Push to feature branch
- [ ] Create pull request
- [ ] Deploy to staging environment

---

## 🔧 Development Environment Setup

### Required Tools
```bash
# Install dependencies
npm install -g pnpm
pnpm install

# Additional packages for document processing
pnpm add pdf-parse mammoth xlsx papaparse
pnpm add @types/pdf-parse @types/papaparse

# Chart libraries
pnpm add chart.js react-chartjs-2 d3

# File upload utilities
pnpm add react-dropzone

# Document export libraries
pnpm add jspdf html2canvas
```

### Environment Variables
```env
# Add to .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Feature flags
DOCUMENT_PROCESSING_ENABLED=true
DATA_VISUALIZATION_ENABLED=true
TEMPLATE_MATCHING_ENABLED=true

# Processing limits
MAX_FILE_SIZE_MB=50
MAX_PROCESSING_TIME_MS=300000
EMBEDDING_BATCH_SIZE=100
```

### Database Migration
```bash
# Deploy new schema
npx convex dev
npx convex deploy

# Verify tables are created
npx convex dashboard
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Vector Embedding Dimension Mismatch
**Problem:** Embedding dimensions don't match index
**Solution:** Ensure all embeddings use same model (1536 for OpenAI)

### Issue 2: File Upload Timeout
**Problem:** Large files cause timeout
**Solution:** Implement chunked upload and background processing

### Issue 3: Template Matching Poor Results
**Problem:** Low similarity scores for obvious matches
**Solution:** Improve text preprocessing and embedding quality

### Issue 4: Real-time Updates Not Working
**Problem:** UI doesn't update during processing
**Solution:** Verify Convex subscriptions and mutation calls

---

This gives you a concrete roadmap with specific files to create/modify and step-by-step implementation details. Would you like me to create the enhanced system prompt next?

