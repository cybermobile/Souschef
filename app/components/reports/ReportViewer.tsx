import React, { useState } from 'react';
import { Chart as ChartJS } from 'chart.js';

interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'chart' | 'table' | 'image';
  chartId?: string;
}

interface ChartData {
  chartId: string;
  chartType: string;
  title: string;
  description?: string;
  config: any;
  data: any;
  insights?: string[];
}

interface TableData {
  tableId: string;
  title: string;
  headers: string[];
  data: any[][];
}

interface Report {
  _id: string;
  reportName: string;
  reportType: string;
  content: {
    body: string;
    sections: ReportSection[];
    executiveSummary?: string;
    keyFindings?: Array<{
      finding: string;
      importance: 'high' | 'medium' | 'low';
      supportingData?: string;
    }>;
    recommendations?: Array<{
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact?: string;
      implementation?: string;
    }>;
  };
  charts: ChartData[];
  tables?: TableData[];
  metadata: {
    author?: string;
    createdDate: number;
    lastModified: number;
    version: string;
    confidentiality?: string;
    department?: string;
    project?: string;
    tags: string[];
  };
  formatting: {
    theme: string;
    colorScheme?: string;
    fontFamily?: string;
    includePageNumbers: boolean;
    includeTOC: boolean;
    includeHeader: boolean;
    includeFooter: boolean;
    logoUrl?: string;
  };
}

interface ReportViewerProps {
  report: Report;
  onExport?: (format: 'pdf' | 'docx' | 'pptx' | 'html') => void;
  onShare?: () => void;
  className?: string;
}

// Mock report data for demonstration
const createMockReport = (): Report => ({
  _id: 'report_1',
  reportName: 'Q3 Sales Analysis Report',
  reportType: 'combined_report',
  content: {
    body: 'Comprehensive analysis of Q3 sales performance with data insights and recommendations.',
    sections: [
      {
        id: 'exec_summary',
        title: 'Executive Summary',
        content:
          'Q3 sales performance exceeded expectations with a 23% increase over Q2, driven primarily by strong performance in the digital channels and successful product launches.',
        order: 1,
        type: 'text',
      },
      {
        id: 'sales_chart',
        title: 'Sales Performance',
        content: 'Monthly sales trends show consistent growth throughout Q3.',
        order: 2,
        type: 'chart',
        chartId: 'chart_1',
      },
      {
        id: 'analysis',
        title: 'Detailed Analysis',
        content:
          'The growth was primarily driven by increased digital adoption, with online sales accounting for 68% of total revenue. Mobile sales specifically grew by 45% compared to Q2.',
        order: 3,
        type: 'text',
      },
    ],
    executiveSummary:
      'Q3 delivered strong growth across all key metrics, with particular strength in digital channels.',
    keyFindings: [
      {
        finding: 'Digital sales increased 45% over Q2',
        importance: 'high',
        supportingData: 'Mobile sales: $2.3M, Desktop: $1.8M',
      },
      {
        finding: 'Customer acquisition cost decreased 15%',
        importance: 'medium',
        supportingData: 'From $45 to $38 per customer',
      },
    ],
    recommendations: [
      {
        recommendation: 'Increase investment in mobile optimization',
        priority: 'high',
        expectedImpact: 'Potential 30% increase in mobile conversions',
        implementation: 'Redesign mobile checkout process by end of Q4',
      },
      {
        recommendation: 'Expand digital marketing budget',
        priority: 'medium',
        expectedImpact: 'Sustain current growth rate',
        implementation: 'Reallocate 20% of traditional marketing budget',
      },
    ],
  },
  charts: [
    {
      chartId: 'chart_1',
      chartType: 'line',
      title: 'Monthly Sales Trend',
      description: 'Sales performance by month in Q3',
      config: {},
      data: {},
      insights: ['Consistent upward trend', 'September showed 12% growth over August'],
    },
  ],
  metadata: {
    author: 'Sales Analytics Team',
    createdDate: Date.now() - 86400000,
    lastModified: Date.now() - 3600000,
    version: '1.2',
    confidentiality: 'Internal',
    department: 'Sales',
    project: 'Q3 Review',
    tags: ['sales', 'quarterly', 'analysis', 'growth'],
  },
  formatting: {
    theme: 'professional',
    colorScheme: 'blue',
    includePageNumbers: true,
    includeTOC: true,
    includeHeader: true,
    includeFooter: true,
  },
});

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report: propReport,
  onExport,
  onShare,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'read' | 'print'>('read');
  const [showTOC, setShowTOC] = useState(false);

  // Use prop report or mock data
  const report = propReport || createMockReport();

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportFormats = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'docx', label: 'Word', icon: '📝' },
    { value: 'pptx', label: 'PowerPoint', icon: '📊' },
    { value: 'html', label: 'HTML', icon: '🌐' },
  ];

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.reportName}</h1>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>v{report.metadata.version}</span>
                <span>•</span>
                <span>Modified {formatDate(report.metadata.lastModified)}</span>
                <span>•</span>
                <span className="capitalize">{report.metadata.confidentiality}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View mode toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('read')}
                  className={`rounded-l-md border px-3 py-2 text-sm font-medium ${
                    viewMode === 'read'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Read
                </button>
                <button
                  onClick={() => setViewMode('print')}
                  className={`rounded-r-md border-y border-r px-3 py-2 text-sm font-medium ${
                    viewMode === 'print'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Print
                </button>
              </div>

              {/* Table of Contents */}
              <button
                onClick={() => setShowTOC(!showTOC)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                TOC
              </button>

              {/* Export dropdown */}
              <div className="relative inline-block text-left">
                <select
                  onChange={(e) => onExport?.(e.target.value as any)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Export as...
                  </option>
                  {exportFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.icon} {format.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Share button */}
              {onShare && (
                <button
                  onClick={onShare}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Table of Contents Sidebar */}
        {showTOC && (
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 font-medium text-gray-900">Table of Contents</h3>
            <nav className="space-y-2">
              {report.content.executiveSummary && (
                <a href="#executive-summary" className="block text-sm text-blue-600 hover:text-blue-800">
                  Executive Summary
                </a>
              )}
              {report.content.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block pl-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {section.title}
                  </a>
                ))}
              {report.content.keyFindings && (
                <a href="#key-findings" className="block text-sm text-blue-600 hover:text-blue-800">
                  Key Findings
                </a>
              )}
              {report.content.recommendations && (
                <a href="#recommendations" className="block text-sm text-blue-600 hover:text-blue-800">
                  Recommendations
                </a>
              )}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className={`${viewMode === 'print' ? 'mx-auto max-w-4xl' : ''} space-y-8 p-8`}>
            {/* Metadata */}
            <div className="border-b border-gray-200 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <span className="font-medium text-gray-500">Author:</span>
                  <p className="text-gray-900">{report.metadata.author || 'Unknown'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Department:</span>
                  <p className="text-gray-900">{report.metadata.department || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Project:</span>
                  <p className="text-gray-900">{report.metadata.project || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <p className="text-gray-900">{formatDate(report.metadata.createdDate)}</p>
                </div>
              </div>
              {report.metadata.tags.length > 0 && (
                <div className="mt-4">
                  <span className="mb-2 block font-medium text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {report.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Executive Summary */}
            {report.content.executiveSummary && (
              <div id="executive-summary">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Executive Summary</h2>
                <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                  <p className="leading-relaxed text-gray-700">{report.content.executiveSummary}</p>
                </div>
              </div>
            )}

            {/* Report Sections */}
            {report.content.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} id={section.id}>
                  <h2 className="mb-4 text-xl font-bold text-gray-900">{section.title}</h2>

                  {section.type === 'text' && (
                    <div className="prose max-w-none">
                      <p className="leading-relaxed text-gray-700">{section.content}</p>
                    </div>
                  )}

                  {section.type === 'chart' && section.chartId && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      {(() => {
                        const chart = report.charts.find((c) => c.chartId === section.chartId);
                        return chart ? (
                          <div>
                            <h3 className="mb-2 font-medium text-gray-900">{chart.title}</h3>
                            {chart.description && <p className="mb-4 text-sm text-gray-600">{chart.description}</p>}
                            <div className="flex h-64 items-center justify-center rounded bg-gray-100">
                              <span className="text-gray-500">Chart: {chart.title}</span>
                            </div>
                            {chart.insights && chart.insights.length > 0 && (
                              <div className="mt-4">
                                <h4 className="mb-2 font-medium text-gray-900">Key Insights:</h4>
                                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                                  {chart.insights.map((insight, index) => (
                                    <li key={index}>{insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">Chart not found</div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}

            {/* Key Findings */}
            {report.content.keyFindings && report.content.keyFindings.length > 0 && (
              <div id="key-findings">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Key Findings</h2>
                <div className="space-y-4">
                  {report.content.keyFindings.map((finding, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{finding.finding}</p>
                          {finding.supportingData && (
                            <p className="mt-1 text-sm text-gray-600">{finding.supportingData}</p>
                          )}
                        </div>
                        <span
                          className={`ml-4 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(finding.importance)}`}
                        >
                          {finding.importance} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.content.recommendations && report.content.recommendations.length > 0 && (
              <div id="recommendations">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Recommendations</h2>
                <div className="space-y-4">
                  {report.content.recommendations.map((rec, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="flex-1 font-medium text-gray-900">{rec.recommendation}</h3>
                        <span
                          className={`ml-4 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority} priority
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        {rec.expectedImpact && (
                          <div>
                            <span className="font-medium text-gray-500">Expected Impact:</span>
                            <p className="text-gray-700">{rec.expectedImpact}</p>
                          </div>
                        )}
                        {rec.implementation && (
                          <div>
                            <span className="font-medium text-gray-500">Implementation:</span>
                            <p className="text-gray-700">{rec.implementation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
