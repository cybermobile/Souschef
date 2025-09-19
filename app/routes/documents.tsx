import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { DocumentUploader } from '~/components/document/DocumentUploader';
import { ProcessingStatus } from '~/components/document/ProcessingStatus';
import type { Id } from '@convex/_generated/dataModel';
import { ChefAuthProvider } from '~/components/chat/ChefAuthWrapper';

export const meta: MetaFunction = () => {
  return [
    { title: 'Documents | SousChef' },
    { name: 'description', content: 'Upload and manage your documents with AI-powered processing' },
  ];
};

export const loader = async (_args: LoaderFunctionArgs) => {
  // TODO: Fetch user's documents from Convex
  // For now, return empty data
  return json({
    documents: [],
    processingQueue: [],
  });
};

export default function Documents() {
  return (
    <ChefAuthProvider redirectIfUnauthenticated={true}>
      <DocumentsContent />
    </ChefAuthProvider>
  );
}

function DocumentsContent() {
  const { documents, processingQueue } = useLoaderData<typeof loader>();
  const [lastDocumentId, setLastDocumentId] = useState<Id<'uploadedDocuments'> | null>(null);

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-bolt-elements-textPrimary text-3xl font-bold">Document Library</h1>
            <p className="text-bolt-elements-textSecondary mt-2">
              Upload documents for AI-powered processing, template matching, and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Upload Documents</h2>
                <ClientOnly>
                  {() => (
                    <DocumentUploader
                      onUploadComplete={(documentId) => {
                        setLastDocumentId(documentId);
                      }}
                      className="mb-6"
                    />
                  )}
                </ClientOnly>
              </div>

              {/* Documents List */}
              <div className="border-bolt-elements-borderColor mt-8 rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Your Documents</h2>
                {documents.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="text-bolt-elements-textSecondary">
                      No documents uploaded yet. Upload your first document to get started!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="border-bolt-elements-borderColor rounded-lg border p-4">
                        <h3 className="text-bolt-elements-textPrimary font-medium">{doc.fileName}</h3>
                        <p className="text-bolt-elements-textSecondary mt-1 text-sm">{doc.fileType}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              doc.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : doc.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                          <span className="text-bolt-elements-textSecondary text-xs">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Processing Status Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Processing Status</h2>
                <ClientOnly>
                  {() => (
                    <ProcessingStatus documentId={lastDocumentId ?? undefined} className="space-y-3" showDetails />
                  )}
                </ClientOnly>
              </div>

              {/* Quick Stats */}
              <div className="border-bolt-elements-borderColor mt-6 rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <h3 className="text-bolt-elements-textPrimary mb-4 text-lg font-medium">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Total Documents</span>
                    <span className="text-bolt-elements-textPrimary font-medium">{documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Processing</span>
                    <span className="text-bolt-elements-textPrimary font-medium">{processingQueue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Completed</span>
                    <span className="text-bolt-elements-textPrimary font-medium">
                      {documents.filter((d: any) => d.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
