import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { Header } from '~/components/header/Header';
import { exportData as exportUtility, type ExportFormat } from '~/utils/exportUtils';

type ReportSummary = {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  status?: string;
  type?: string;
  author?: string;
  wordCount?: number;
  pageCount?: number;
  tags?: string[];
  sections?: string[];
  charts?: Array<{ id: string; title: string; type: string }>;
};

type ReportsLoaderData = {
  reports: ReportSummary[];
  filters: {
    status: string[];
    type: string[];
    tags: string[];
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: 'Reports | SousChef' },
    { name: 'description', content: 'View and manage your generated reports with data visualizations' },
  ];
};

export const loader = async (_args: LoaderFunctionArgs) => {
  const data: ReportsLoaderData = {
    reports: [],
    filters: {
      status: [],
      type: [],
      tags: [],
    },
  };
  return json(data);
};

export default function Reports() {
  const { reports, filters } = useLoaderData<typeof loader>();

  const handleExport = (format: ExportFormat, report: ReportSummary) => {
    const exportBody = [report.description, report.summary].filter(Boolean).join('\n\n');
    const exportData = {
      title: report.title,
      content: exportBody,
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
                  {filters.status.length > 0 ? (
                    <div className="space-y-2">
                      {filters.status.map((status) => (
                        <label key={status} className="flex items-center">
                          <input type="checkbox" className="border-border-primary text-accent-primary rounded" />
                          <span className="text-content-secondary ml-2 text-sm capitalize">
                            {status.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-content-tertiary text-sm">No status filters available.</p>
                  )}
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h4 className="text-content-primary mb-2 text-sm font-medium">Report Type</h4>
                  {filters.type.length > 0 ? (
                    <div className="space-y-2">
                      {filters.type.map((type) => (
                        <label key={type} className="flex items-center">
                          <input type="checkbox" className="border-border-primary text-accent-primary rounded" />
                          <span className="text-content-secondary ml-2 text-sm capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-content-tertiary text-sm">No type filters available.</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="border-border-primary mt-8 border-t pt-6">
                  <h4 className="text-content-primary mb-3 text-sm font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary"
                    >
                      Export All Reports
                    </button>
                    <button
                      type="button"
                      className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary"
                    >
                      Generate New Report
                    </button>
                    <button
                      type="button"
                      className="text-content-secondary w-full rounded px-3 py-2 text-left text-sm hover:bg-background-primary"
                    >
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
                <button
                  type="button"
                  className="rounded-lg bg-button-primary-background px-4 py-2 font-medium text-button-primary-text hover:bg-button-primary-background-hover"
                >
                  Generate Report
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="border-border-primary flex flex-col items-center justify-center rounded-lg border bg-background-secondary p-10 text-center">
                  <div className="mb-4 text-5xl">📄</div>
                  <h2 className="text-content-primary mb-2 text-xl font-semibold">No reports yet</h2>
                  <p className="text-content-secondary mb-6 max-w-lg text-sm">
                    Generate a report to see it listed here. Once you create reports, they will appear with quick access
                    to summaries, sections, and exports.
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-button-primary-background px-4 py-2 font-medium text-button-primary-text hover:bg-button-primary-background-hover"
                  >
                    Generate Report
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reports.map((report) => {
                    const status = report.status ?? 'draft';
                    const statusClass =
                      status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800';
                    const sections = report.sections ?? [];
                    const tags = report.tags ?? [];
                    const charts = report.charts ?? [];
                    const description = report.description ?? 'No description available yet.';
                    const summary = report.summary;
                    return (
                      <div
                        key={report.id}
                        className="border-border-primary rounded-lg border bg-background-secondary p-6"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-3">
                              <h3 className="text-content-primary text-xl font-semibold">{report.title}</h3>
                              <span className={`rounded-full px-2 py-1 text-xs ${statusClass}`}>{status}</span>
                              {report.type && (
                                <span className="text-content-secondary rounded-full bg-background-primary px-2 py-1 text-xs capitalize">
                                  {report.type}
                                </span>
                              )}
                            </div>
                            <p className="text-content-secondary mb-3">{description}</p>
                            {summary && (
                              <p className="text-content-secondary mb-4 text-sm italic">&ldquo;{summary}&rdquo;</p>
                            )}
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
                            <span className="text-content-primary ml-1">{report.pageCount ?? '—'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-content-secondary">Words:</span>
                            <span className="text-content-primary ml-1">
                              {typeof report.wordCount === 'number' ? report.wordCount.toLocaleString() : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="mb-2 flex flex-wrap gap-1">
                            {tags.map((tag) => (
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
                            {sections.map((section, index) => (
                              <span
                                key={index}
                                className="text-content-secondary rounded border bg-background-primary px-2 py-1 text-xs"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>

                        {charts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-content-primary mb-2 text-sm font-medium">Visualizations:</h4>
                            <div className="flex flex-wrap gap-2">
                              {charts.map((chart) => (
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
                            <button
                              type="button"
                              className="border-border-primary text-content-primary rounded border px-3 py-1 text-sm transition-colors hover:bg-background-primary"
                            >
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
                            <button
                              type="button"
                              className="rounded bg-button-primary-background px-3 py-1 text-sm text-button-primary-text hover:bg-button-primary-background-hover"
                            >
                              View Report
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
