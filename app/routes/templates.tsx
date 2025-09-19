import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { TemplateSelector } from '~/components/template/TemplateSelector';

export const meta: MetaFunction = () => {
  return [
    { title: 'Templates | SousChef' },
    { name: 'description', content: 'Browse and manage document templates with AI-powered matching' },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  // TODO: Fetch templates from Convex
  // For now, return mock data
  return json({
    templates: [
      {
        id: '1',
        templateName: 'Executive Report Template',
        documentType: 'report',
        category: 'Business',
        description: 'Professional executive report format with executive summary, findings, and recommendations',
        lastUpdated: Date.now() - 86400000, // 1 day ago
        usageCount: 45,
        structure: {
          sections: ['Executive Summary', 'Key Findings', 'Recommendations', 'Next Steps'],
          estimatedLength: '3-5 pages',
        },
      },
      {
        id: '2',
        templateName: 'Financial Analysis Report',
        documentType: 'financial',
        category: 'Finance',
        description: 'Comprehensive financial analysis template with charts, ratios, and variance analysis',
        lastUpdated: Date.now() - 172800000, // 2 days ago
        usageCount: 32,
        structure: {
          sections: ['Financial Summary', 'Performance Analysis', 'Variance Explanation', 'Outlook'],
          estimatedLength: '4-6 pages',
        },
      },
      {
        id: '3',
        templateName: 'Project Status Report',
        documentType: 'project',
        category: 'Operations',
        description: 'Project management report template with milestones, risks, and timeline tracking',
        lastUpdated: Date.now() - 259200000, // 3 days ago
        usageCount: 28,
        structure: {
          sections: ['Project Overview', 'Status Update', 'Issues & Risks', 'Next Milestones'],
          estimatedLength: '2-3 pages',
        },
      },
    ],
    categories: ['Business', 'Finance', 'Operations', 'Technical', 'Marketing', 'Legal'],
    searchFilters: {
      type: ['report', 'proposal', 'memo', 'analysis', 'project', 'financial'],
      industry: ['technology', 'finance', 'healthcare', 'manufacturing', 'retail'],
    },
  });
};

export default function Templates() {
  const { templates, categories, searchFilters } = useLoaderData<typeof loader>();

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-bolt-elements-textPrimary text-3xl font-bold">Template Gallery</h1>
            <p className="text-bolt-elements-textSecondary mt-2">
              Browse and discover document templates with AI-powered matching for your content
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <h3 className="text-bolt-elements-textPrimary mb-4 text-lg font-medium">Filter Templates</h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-bolt-elements-textPrimary mb-2 text-sm font-medium">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="border-bolt-elements-borderColor text-bolt-elements-focus rounded"
                        />
                        <span className="text-bolt-elements-textSecondary ml-2 text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Document Type Filter */}
                <div className="mb-6">
                  <h4 className="text-bolt-elements-textPrimary mb-2 text-sm font-medium">Document Type</h4>
                  <div className="space-y-2">
                    {searchFilters.type.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="border-bolt-elements-borderColor text-bolt-elements-focus rounded"
                        />
                        <span className="text-bolt-elements-textSecondary ml-2 text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="border-bolt-elements-borderColor mt-8 border-t pt-6">
                  <h4 className="text-bolt-elements-textPrimary mb-3 text-sm font-medium">Template Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Total Templates</span>
                      <span className="text-bolt-elements-textPrimary font-medium">{templates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Categories</span>
                      <span className="text-bolt-elements-textPrimary font-medium">{categories.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="border-bolt-elements-borderColor text-bolt-elements-textPrimary placeholder:text-bolt-elements-textSecondary focus:ring-bolt-elements-focus rounded-lg border bg-bolt-elements-background-depth-1 px-4 py-2 focus:outline-none focus:ring-2"
                  />
                  <select className="border-bolt-elements-borderColor text-bolt-elements-textPrimary focus:ring-bolt-elements-focus rounded-lg border bg-bolt-elements-background-depth-1 px-3 py-2 focus:outline-none focus:ring-2">
                    <option>Sort by Relevance</option>
                    <option>Sort by Usage</option>
                    <option>Sort by Date</option>
                  </select>
                </div>
                <button className="rounded-lg bg-bolt-elements-button-primary-background px-4 py-2 font-medium text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover">
                  Upload Template
                </button>
              </div>

              <ClientOnly>
                {() => (
                  <TemplateSelector
                    templates={templates}
                    onTemplateSelect={(template) => {
                      console.log('Template selected:', template);
                      // TODO: Handle template selection
                    }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2"
                  />
                )}
              </ClientOnly>

              {/* Template Cards */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border-bolt-elements-borderColor hover:border-bolt-elements-focus rounded-lg border bg-bolt-elements-background-depth-2 p-6 transition-colors"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-bolt-elements-textPrimary text-lg font-semibold">{template.templateName}</h3>
                      <span className="text-bolt-elements-textSecondary rounded-full bg-bolt-elements-background-depth-3 px-2 py-1 text-xs">
                        {template.category}
                      </span>
                    </div>

                    <p className="text-bolt-elements-textSecondary mb-4 text-sm">{template.description}</p>

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-bolt-elements-textSecondary">Document Type:</span>
                        <span className="text-bolt-elements-textPrimary capitalize">{template.documentType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-bolt-elements-textSecondary">Usage Count:</span>
                        <span className="text-bolt-elements-textPrimary">{template.usageCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-bolt-elements-textSecondary">Estimated Length:</span>
                        <span className="text-bolt-elements-textPrimary">{template.structure.estimatedLength}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-bolt-elements-textPrimary mb-2 text-sm font-medium">Sections:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.structure.sections.slice(0, 3).map((section, index) => (
                          <span
                            key={index}
                            className="text-bolt-elements-textSecondary rounded bg-bolt-elements-background-depth-1 px-2 py-1 text-xs"
                          >
                            {section}
                          </span>
                        ))}
                        {template.structure.sections.length > 3 && (
                          <span className="text-bolt-elements-textSecondary rounded bg-bolt-elements-background-depth-1 px-2 py-1 text-xs">
                            +{template.structure.sections.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-bolt-elements-textSecondary text-xs">
                        Updated {new Date(template.lastUpdated).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button className="border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded border px-3 py-1 text-sm transition-colors hover:bg-bolt-elements-background-depth-3">
                          Preview
                        </button>
                        <button className="rounded bg-bolt-elements-button-primary-background px-3 py-1 text-sm text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover">
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
