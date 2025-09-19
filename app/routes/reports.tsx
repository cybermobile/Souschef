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

export const loader = async (_args: LoaderFunctionArgs) => {
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
          { id: 'chart2', title: 'Expense Breakdown', type: 'pie' },
        ],
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
          { id: 'chart4', title: 'Growth Projections', type: 'line' },
        ],
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
        charts: [{ id: 'chart5', title: 'Progress Timeline', type: 'bar' }],
      },
    ],
    filters: {
      status: ['completed', 'draft', 'in_progress'],
      type: ['financial', 'research', 'project', 'operational', 'marketing'],
      tags: ['finance', 'quarterly', 'analysis', 'market', 'research', 'competitive', 'project', 'status', 'weekly'],
    },
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
        department: 'SousChef',
      },
    };

    exportUtility(exportData, format);
  };

  return (
    <div className="flex size-full flex-col bg-background-primary">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-content-primary text-3xl font-bold">Generated Reports</h1>
            <p className="text-content-secondary mt-2">
              View, manage, and export your AI-generated reports with embedded visualizations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-border-primary rounded-lg border bg-background-secondary p-6">
                <h3 className="text-content-primary mb-4 text-lg font-medium">Filter Reports</h3>

                {/* Status Filter */}
                <div className="mb-6">
                  <h4 className="text-content-primary mb-2 text-sm font-medium">Status</h4>
                  <div className="space-y-2">
                    {filters.status.map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="border-border-primary text-accent-primary rounded"
                        />
                        <span className="text-content-secondary ml-2 text-sm capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h4 className="text-content-primary mb-2 text-sm font-medium">Report Type</h4>
                  <div className="space-y-2">
                    {filters.type.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="border-border-primary text-accent-primary rounded"
                        />
                        <span className="text-content-secondary ml-2 text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-border-primary mt-8 border-t pt-6">
                  <h4 className="text-content-primary mb-3 text-sm font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <button type="button" className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary">
                      Export All Reports
                    </button>
                    <button type="button" className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary">
                      Generate New Report
                    </button>
                    <button type="button" className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary">
                      Report Templates
                    </button>
                  </div>
                </div>

                {/* Report Stats */}
                <div className="border-border-primary mt-6 border-t pt-6">
                  <h4 className="text-content-primary mb-3 text-sm font-medium">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-content-secondary">Total Reports</span>
                      <span className="text-content-primary font-medium">{reports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">Completed</span>
                      <span className="text-content-primary font-medium">
                        {reports.filter((r) => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">Draft</span>
                      <span className="text-content-primary font-medium">
                        {reports.filter((r) => r.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="border-border-primary text-content-primary placeholder:text-content-secondary focus:ring-accent-primary rounded-lg border bg-background-primary px-4 py-2 focus:outline-none focus:ring-2"
                  />
                  <select
                    aria-label="Sort reports by"
                    className="border-border-primary text-content-primary focus:ring-accent-primary rounded-lg border bg-background-primary px-3 py-2 focus:outline-none focus:ring-2"
                  >
                    <option>Sort by Date</option>
                    <option>Sort by Title</option>
                    <option>Sort by Type</option>
                    <option>Sort by Status</option>
                  </select>
                </div>
                <button type="button" className="rounded-lg bg-button-primary-background px-4 py-2 font-medium text-button-primary-text hover:bg-button-primary-background-hover">
                  Generate Report
                </button>
              </div>

              <div className="space-y-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border-border-primary rounded-lg border bg-background-secondary p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h3 className="text-content-primary text-xl font-semibold">{report.title}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              report.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : report.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {report.status}
                          </span>
                          <span className="text-content-secondary rounded-full bg-background-primary px-2 py-1 text-xs capitalize">
                            {report.type}
                          </span>
                        </div>
                        <p className="text-content-secondary mb-3">{report.description}</p>
                        <p className="text-content-secondary mb-4 text-sm italic">&ldquo;{report.summary}&rdquo;</p>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="text-sm">
                        <span className="text-content-secondary">Created:</span>
                        <span className="text-content-primary ml-1">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-content-secondary">Pages:</span>
                        <span className="text-content-primary ml-1">{report.pageCount}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-content-secondary">Words:</span>
                        <span className="text-content-primary ml-1">{report.wordCount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex flex-wrap gap-1">
                        {report.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-content-secondary rounded bg-background-primary px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-content-primary mb-2 text-sm font-medium">Sections:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.sections.map((section, index) => (
                          <span
                            key={index}
                            className="text-content-secondary rounded border bg-background-primary px-2 py-1 text-xs"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    {report.charts && report.charts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-content-primary mb-2 text-sm font-medium">Visualizations:</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.charts.map((chart) => (
                            <span
                              key={chart.id}
                              className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 rounded border px-2 py-1 text-xs"
                            >
                              📊 {chart.title} ({chart.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-content-secondary text-xs">
                        Last updated {new Date(report.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button type="button" className="border-border-primary text-content-primary rounded border px-3 py-1 text-sm transition-colors hover:bg-background-primary">
                          Preview
                        </button>
                        <select
                          aria-label="Export format"
                          onChange={(e) => e.target.value && handleExport(e.target.value as ExportFormat, report)}
                          className="border-border-primary text-content-primary rounded border px-3 py-1 text-sm transition-colors hover:bg-background-primary"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Export
                          </option>
                          <option value="html">HTML</option>
                          <option value="pdf">PDF</option>
                          <option value="docx">Word</option>
                          <option value="pptx">PowerPoint</option>
                        </select>
                        <button type="button" className="rounded bg-button-primary-background px-3 py-1 text-sm text-button-primary-text hover:bg-button-primary-background-hover">
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
                        _id: 'sample-1',
                        reportName: 'Sample Report',
                        reportType: 'sample',
                        content: {
                          body: 'This is a sample report content...',
                          sections: [],
                        },
                        charts: [],
                        tables: [],
                        metadata: {
                          author: 'AI Assistant',
                          createdDate: Date.now(),
                          lastModified: Date.now(),
                          version: '1.0',
                          confidentiality: 'Internal',
                          department: 'SousChef',
                          project: 'Sample',
                          tags: ['sample'],
                        },
                        formatting: {
                          theme: 'professional',
                          includePageNumbers: true,
                          includeTOC: false,
                          includeHeader: true,
                          includeFooter: true,
                        },
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