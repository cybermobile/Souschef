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
          estimatedLength: '3-5 pages'
        }
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
          estimatedLength: '4-6 pages'
        }
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
          estimatedLength: '2-3 pages'
        }
      }
    ],
    categories: ['Business', 'Finance', 'Operations', 'Technical', 'Marketing', 'Legal'],
    searchFilters: {
      type: ['report', 'proposal', 'memo', 'analysis', 'project', 'financial'],
      industry: ['technology', 'finance', 'healthcare', 'manufacturing', 'retail']
    }
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
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary">Template Gallery</h1>
            <p className="mt-2 text-bolt-elements-textSecondary">
              Browse and discover document templates with AI-powered matching for your content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Filter Templates</h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-bolt-elements-borderColor text-bolt-elements-focus"
                        />
                        <span className="ml-2 text-sm text-bolt-elements-textSecondary">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Document Type Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Document Type</h4>
                  <div className="space-y-2">
                    {searchFilters.type.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-bolt-elements-borderColor text-bolt-elements-focus"
                        />
                        <span className="ml-2 text-sm text-bolt-elements-textSecondary capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="mt-8 pt-6 border-t border-bolt-elements-borderColor">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-3">Template Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Total Templates</span>
                      <span className="font-medium text-bolt-elements-textPrimary">{templates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Categories</span>
                      <span className="font-medium text-bolt-elements-textPrimary">{categories.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="px-4 py-2 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary placeholder-bolt-elements-textSecondary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
                  />
                  <select className="px-3 py-2 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus">
                    <option>Sort by Relevance</option>
                    <option>Sort by Usage</option>
                    <option>Sort by Date</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-lg font-medium">
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  />
                )}
              </ClientOnly>

              {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor hover:border-bolt-elements-focus transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">{template.templateName}</h3>
                      <span className="px-2 py-1 bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs rounded-full">
                        {template.category}
                      </span>
                    </div>

                    <p className="text-bolt-elements-textSecondary text-sm mb-4">{template.description}</p>

                    <div className="space-y-2 mb-4">
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
                      <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Sections:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.structure.sections.slice(0, 3).map((section, index) => (
                          <span key={index} className="px-2 py-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs rounded">
                            {section}
                          </span>
                        ))}
                        {template.structure.sections.length > 3 && (
                          <span className="px-2 py-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs rounded">
                            +{template.structure.sections.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-bolt-elements-textSecondary">
                        Updated {new Date(template.lastUpdated).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded hover:bg-bolt-elements-background-depth-3 transition-colors">
                          Preview
                        </button>
                        <button className="px-3 py-1 text-sm bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded">
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