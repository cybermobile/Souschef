import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ReportViewer } from '~/components/reports/ReportViewer';
import { exportData as exportUtility, type ExportFormat } from '~/utils/exportUtils';

export const meta: MetaFunction = () => {
  return [
    { title: 'Reports | SousChef' },
    { name: 'description', content: 'View and manage your generated reports with data visualizations' },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  // TODO: Fetch reports from Convex
  // For now, return mock data
  return json({
    reports: [
      {
        id: '1',
        title: 'Q3 Financial Analysis Report',
        description: 'Comprehensive analysis of Q3 financial performance with key metrics and trends',
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 3600000, // 1 hour ago
        status: 'completed',
        type: 'financial',
        author: 'AI Assistant',
        wordCount: 2450,
        pageCount: 8,
        tags: ['finance', 'quarterly', 'analysis'],
        summary: 'Strong Q3 performance with 15% revenue growth and improved operational efficiency.',
        sections: ['Executive Summary', 'Revenue Analysis', 'Cost Analysis', 'Recommendations'],
        charts: [
          { id: 'chart1', title: 'Revenue Trend', type: 'line' },
          { id: 'chart2', title: 'Expense Breakdown', type: 'pie' }
        ]
      },
      {
        id: '2',
        title: 'Market Research Summary',
        description: 'Analysis of competitor landscape and market opportunities',
        createdAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 86400000, // 1 day ago
        status: 'completed',
        type: 'research',
        author: 'AI Assistant',
        wordCount: 1850,
        pageCount: 6,
        tags: ['market', 'research', 'competitive'],
        summary: 'Identified key growth opportunities in emerging markets with competitive advantages.',
        sections: ['Market Overview', 'Competitive Analysis', 'Opportunities', 'Strategic Recommendations'],
        charts: [
          { id: 'chart3', title: 'Market Share', type: 'bar' },
          { id: 'chart4', title: 'Growth Projections', type: 'line' }
        ]
      },
      {
        id: '3',
        title: 'Project Status Dashboard',
        description: 'Weekly project status update with milestones and deliverables',
        createdAt: Date.now() - 259200000, // 3 days ago
        updatedAt: Date.now() - 172800000, // 2 days ago
        status: 'draft',
        type: 'project',
        author: 'AI Assistant',
        wordCount: 980,
        pageCount: 3,
        tags: ['project', 'status', 'weekly'],
        summary: 'Project on track with 85% completion rate and all major milestones met.',
        sections: ['Project Overview', 'Progress Update', 'Issues & Risks', 'Next Steps'],
        charts: [
          { id: 'chart5', title: 'Progress Timeline', type: 'bar' }
        ]
      }
    ],
    filters: {
      status: ['completed', 'draft', 'in_progress'],
      type: ['financial', 'research', 'project', 'operational', 'marketing'],
      tags: ['finance', 'quarterly', 'analysis', 'market', 'research', 'competitive', 'project', 'status', 'weekly']
    }
  });
};

export default function Reports() {
  const { reports, filters } = useLoaderData<typeof loader>();

  const handleExport = (format: ExportFormat, report: any) => {
    const exportData = {
      title: report.title,
      content: report.description + '\n\n' + report.summary,
      charts: report.charts || [],
      metadata: {
        author: report.author,
        createdDate: report.createdAt,
        department: 'SousChef'
      }
    };

    exportUtility(exportData, format);
  };

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary">Generated Reports</h1>
            <p className="mt-2 text-bolt-elements-textSecondary">
              View, manage, and export your AI-generated reports with embedded visualizations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Filter Reports</h3>

                {/* Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Status</h4>
                  <div className="space-y-2">
                    {filters.status.map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-bolt-elements-borderColor text-bolt-elements-focus"
                        />
                        <span className="ml-2 text-sm text-bolt-elements-textSecondary capitalize">{status.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Report Type</h4>
                  <div className="space-y-2">
                    {filters.type.map((type) => (
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

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-bolt-elements-borderColor">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 rounded">
                      Export All Reports
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 rounded">
                      Generate New Report
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 rounded">
                      Report Templates
                    </button>
                  </div>
                </div>

                {/* Report Stats */}
                <div className="mt-6 pt-6 border-t border-bolt-elements-borderColor">
                  <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-3">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Total Reports</span>
                      <span className="font-medium text-bolt-elements-textPrimary">{reports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Completed</span>
                      <span className="font-medium text-bolt-elements-textPrimary">
                        {reports.filter(r => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bolt-elements-textSecondary">Draft</span>
                      <span className="font-medium text-bolt-elements-textPrimary">
                        {reports.filter(r => r.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="px-4 py-2 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary placeholder-bolt-elements-textSecondary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
                  />
                  <select className="px-3 py-2 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus">
                    <option>Sort by Date</option>
                    <option>Sort by Title</option>
                    <option>Sort by Type</option>
                    <option>Sort by Status</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-lg font-medium">
                  Generate Report
                </button>
              </div>

              <div className="space-y-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-bolt-elements-textPrimary">{report.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {report.status}
                          </span>
                          <span className="px-2 py-1 bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs rounded-full capitalize">
                            {report.type}
                          </span>
                        </div>
                        <p className="text-bolt-elements-textSecondary mb-3">{report.description}</p>
                        <p className="text-sm text-bolt-elements-textSecondary italic mb-4">"{report.summary}"</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-bolt-elements-textSecondary">Created:</span>
                        <span className="text-bolt-elements-textPrimary ml-1">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-bolt-elements-textSecondary">Pages:</span>
                        <span className="text-bolt-elements-textPrimary ml-1">{report.pageCount}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-bolt-elements-textSecondary">Words:</span>
                        <span className="text-bolt-elements-textPrimary ml-1">{report.wordCount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {report.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Sections:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.sections.map((section, index) => (
                          <span key={index} className="px-2 py-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs rounded border">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    {report.charts && report.charts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-bolt-elements-textPrimary mb-2">Visualizations:</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.charts.map((chart) => (
                            <span key={chart.id} className="px-2 py-1 bg-bolt-elements-focus/10 text-bolt-elements-focus text-xs rounded border border-bolt-elements-focus/20">
                              📊 {chart.title} ({chart.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-bolt-elements-textSecondary">
                        Last updated {new Date(report.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded hover:bg-bolt-elements-background-depth-3 transition-colors">
                          Preview
                        </button>
                        <select
                          onChange={(e) => e.target.value && handleExport(e.target.value as ExportFormat, report)}
                          className="px-3 py-1 text-sm border border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded hover:bg-bolt-elements-background-depth-3 transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>Export</option>
                          <option value="html">HTML</option>
                          <option value="pdf">PDF</option>
                          <option value="docx">Word</option>
                          <option value="pptx">PowerPoint</option>
                        </select>
                        <button className="px-3 py-1 text-sm bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded">
                          View Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Report Viewer Component (hidden by default, shown when viewing a report) */}
              <div className="hidden">
                <ClientOnly>
                  {() => (
                    <ReportViewer
                      report={{
                        title: "Sample Report",
                        content: "This is a sample report content...",
                        charts: [],
                        sections: []
                      }}
                      onExport={(format) => {
                        console.log('Export to:', format);
                        // TODO: Handle export
                      }}
                    />
                  )}
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}