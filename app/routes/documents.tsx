import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { DocumentUploader } from '~/components/document/DocumentUploader';
import { ProcessingStatus } from '~/components/document/ProcessingStatus';

export const meta: MetaFunction = () => {
  return [
    { title: 'Documents | SousChef' },
    { name: 'description', content: 'Upload and manage your documents with AI-powered processing' },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  // TODO: Fetch user's documents from Convex
  // For now, return empty data
  return json({
    documents: [],
    processingQueue: []
  });
};

export default function Documents() {
  const { documents, processingQueue } = useLoaderData<typeof loader>();

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary">Document Library</h1>
            <p className="mt-2 text-bolt-elements-textSecondary">
              Upload documents for AI-powered processing, template matching, and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">Upload Documents</h2>
                <ClientOnly>
                  {() => (
                    <DocumentUploader
                      onUpload={(files) => {
                        console.log('Files uploaded:', files);
                        // TODO: Handle file upload
                      }}
                      className="mb-6"
                    />
                  )}
                </ClientOnly>
              </div>

              {/* Documents List */}
              <div className="mt-8 bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">Your Documents</h2>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-bolt-elements-textSecondary">
                      No documents uploaded yet. Upload your first document to get started!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="p-4 border border-bolt-elements-borderColor rounded-lg">
                        <h3 className="font-medium text-bolt-elements-textPrimary">{doc.fileName}</h3>
                        <p className="text-sm text-bolt-elements-textSecondary mt-1">{doc.fileType}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doc.status}
                          </span>
                          <span className="text-xs text-bolt-elements-textSecondary">
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
              <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">Processing Status</h2>
                <ClientOnly>
                  {() => (
                    <ProcessingStatus
                      files={processingQueue}
                      className="space-y-3"
                    />
                  )}
                </ClientOnly>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Total Documents</span>
                    <span className="font-medium text-bolt-elements-textPrimary">{documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Processing</span>
                    <span className="font-medium text-bolt-elements-textPrimary">{processingQueue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bolt-elements-textSecondary">Completed</span>
                    <span className="font-medium text-bolt-elements-textPrimary">
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