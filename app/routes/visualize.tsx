import { useMemo } from 'react';
import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ChartBuilder } from '~/components/charts/ChartBuilder';
import type { DataColumn } from '~/components/charts/ChartBuilder';
import { DataUploader } from '~/components/document/DataUploader';
import { ChefAuthProvider } from '~/components/chat/ChefAuthWrapper';

const VALID_COLUMN_TYPES = ['string', 'number', 'boolean', 'date'] as const;

const isValidColumnType = (type: string): type is (typeof VALID_COLUMN_TYPES)[number] =>
  (VALID_COLUMN_TYPES as readonly string[]).includes(type);

const toChartColumns = (columns: Array<{ name: string; type: string; values: unknown }>): DataColumn[] =>
  columns.map((column) => ({
    name: column.name,
    type: isValidColumnType(column.type) ? column.type : 'string',
    values: Array.isArray(column.values) ? (column.values as any[]) : ([] as any[]),
  }));

export const meta: MetaFunction = () => {
  return [
    { title: 'Data Visualization | SousChef' },
    { name: 'description', content: 'Create beautiful charts and visualizations from your data' },
  ];
};

export const loader = async (_args: LoaderFunctionArgs) => {
  // TODO: Fetch user's data files and charts from Convex
  // For now, return mock data
  return json({
    dataFiles: [
      {
        id: '1',
        fileName: 'sales_data.csv',
        uploadedAt: Date.now() - 86400000,
        rowCount: 1250,
        columnCount: 8,
        headers: ['Date', 'Region', 'Product', 'Sales', 'Units', 'Customer_Type', 'Revenue', 'Profit_Margin'],
        columns: [
          { name: 'Date', type: 'date', values: [] },
          { name: 'Region', type: 'string', values: [] },
          { name: 'Product', type: 'string', values: [] },
          { name: 'Sales', type: 'number', values: [] },
          { name: 'Units', type: 'number', values: [] },
          { name: 'Customer_Type', type: 'string', values: [] },
          { name: 'Revenue', type: 'number', values: [] },
          { name: 'Profit_Margin', type: 'number', values: [] },
        ],
      },
      {
        id: '2',
        fileName: 'marketing_metrics.xlsx',
        uploadedAt: Date.now() - 172800000,
        rowCount: 890,
        columnCount: 6,
        headers: ['Campaign', 'Channel', 'Impressions', 'Clicks', 'Conversions', 'Cost'],
        columns: [
          { name: 'Campaign', type: 'string', values: [] },
          { name: 'Channel', type: 'string', values: [] },
          { name: 'Impressions', type: 'number', values: [] },
          { name: 'Clicks', type: 'number', values: [] },
          { name: 'Conversions', type: 'number', values: [] },
          { name: 'Cost', type: 'number', values: [] },
        ],
      },
    ],
    savedCharts: [
      {
        id: '1',
        title: 'Monthly Sales Trend',
        type: 'line',
        dataFileId: '1',
        config: {
          xAxis: 'Date',
          yAxis: 'Sales',
          chartType: 'line',
        },
        createdAt: Date.now() - 3600000,
      },
      {
        id: '2',
        title: 'Revenue by Region',
        type: 'bar',
        dataFileId: '1',
        config: {
          xAxis: 'Region',
          yAxis: 'Revenue',
          chartType: 'bar',
        },
        createdAt: Date.now() - 7200000,
      },
    ],
    chartRecommendations: [
      {
        chartType: 'line',
        confidence: 0.9,
        title: 'Sales Trend Over Time',
        reasoning: 'Time series data is best visualized with line charts to show trends',
        config: { xAxis: 'Date', yAxis: 'Sales' },
      },
      {
        chartType: 'pie',
        confidence: 0.8,
        title: 'Market Share by Region',
        reasoning: 'Categorical data showing parts of a whole works well with pie charts',
        config: { xAxis: 'Region', yAxis: 'Revenue' },
      },
    ],
  });
};

export default function Visualize() {
  return (
    <ChefAuthProvider redirectIfUnauthenticated={true}>
      <VisualizeContent />
    </ChefAuthProvider>
  );
}

function VisualizeContent() {
  const { dataFiles: rawDataFiles, savedCharts, chartRecommendations } = useLoaderData<typeof loader>();

  const dataFiles = useMemo(
    () =>
      rawDataFiles.map((file) => ({
        ...file,
        columns: toChartColumns(file.columns as Array<{ name: string; type: string; values: unknown }>),
      })),
    [rawDataFiles],
  );

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-bolt-elements-textPrimary text-3xl font-bold">Data Visualization Workspace</h1>
            <p className="text-bolt-elements-textSecondary mt-2">
              Upload data, build interactive charts, and create compelling visualizations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Data Sources Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Data Upload */}
                <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                  <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Upload Data</h2>
                  <ClientOnly>
                    {() => (
                      <DataUploader
                        onUploadComplete={(dataFileId) => {
                          console.log('Data uploaded:', dataFileId);
                          // TODO: Handle data upload completion
                        }}
                        onDataPreview={(preview) => {
                          console.log('Data preview:', preview);
                          // TODO: Handle preview display
                        }}
                        onUploadError={(error) => {
                          console.error('Data upload failed:', error);
                        }}
                        className="mb-4"
                      />
                    )}
                  </ClientOnly>
                </div>

                {/* Data Files */}
                <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                  <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Your Data Files</h2>
                  <div className="space-y-3">
                    {dataFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border-bolt-elements-borderColor cursor-pointer rounded-lg border p-3 transition-colors hover:bg-bolt-elements-background-depth-3"
                      >
                        <h4 className="text-bolt-elements-textPrimary text-sm font-medium">{file.fileName}</h4>
                        <div className="text-bolt-elements-textSecondary mt-1 text-xs">
                          {file.rowCount.toLocaleString()} rows • {file.columnCount} columns
                        </div>
                        <div className="text-bolt-elements-textSecondary text-xs">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Charts */}
                <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                  <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Saved Charts</h2>
                  <div className="space-y-3">
                    {savedCharts.map((chart) => (
                      <div
                        key={chart.id}
                        className="border-bolt-elements-borderColor cursor-pointer rounded-lg border p-3 transition-colors hover:bg-bolt-elements-background-depth-3"
                      >
                        <h4 className="text-bolt-elements-textPrimary text-sm font-medium">{chart.title}</h4>
                        <div className="text-bolt-elements-textSecondary mt-1 text-xs capitalize">
                          {chart.type} chart
                        </div>
                        <div className="text-bolt-elements-textSecondary text-xs">
                          {new Date(chart.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Recommendations */}
                <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                  <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">AI Recommendations</h2>
                  <div className="space-y-3">
                    {chartRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="border-bolt-elements-focus/20 bg-bolt-elements-focus/5 rounded-lg border p-3"
                      >
                        <div className="mb-2 flex items-center space-x-2">
                          <h4 className="text-bolt-elements-textPrimary text-sm font-medium">{rec.title}</h4>
                          <span className="bg-bolt-elements-focus/20 text-bolt-elements-focus rounded-full px-2 py-1 text-xs">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-bolt-elements-textSecondary mb-2 text-xs">{rec.reasoning}</p>
                        <button className="text-bolt-elements-focus text-xs hover:underline">
                          Apply Recommendation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Builder Main Area */}
            <div className="lg:col-span-3">
              <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                <div className="mb-6">
                  <h2 className="text-bolt-elements-textPrimary mb-2 text-xl font-semibold">Chart Builder</h2>
                  <p className="text-bolt-elements-textSecondary">
                    Select a data file and configure your visualization
                  </p>
                </div>

                {dataFiles.length > 0 ? (
                  <ClientOnly>
                    {() => (
                      <ChartBuilder
                        data={dataFiles[0].columns}
                        onConfigChange={(config) => {
                          console.log('Chart config changed:', config);
                          // TODO: Handle config changes
                        }}
                        onChartGenerate={(chartData, options) => {
                          console.log('Chart generated:', chartData, options);
                          // TODO: Handle chart generation
                        }}
                        className="space-y-6"
                      />
                    )}
                  </ClientOnly>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-bolt-elements-textSecondary mb-4">
                      <svg className="mx-auto mb-4 size-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <h3 className="text-bolt-elements-textPrimary mb-2 text-lg font-medium">No Data Available</h3>
                      <p className="text-bolt-elements-textSecondary">
                        Upload a CSV or Excel file to start creating visualizations
                      </p>
                    </div>
                    <button className="rounded-lg bg-bolt-elements-button-primary-background px-4 py-2 font-medium text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover">
                      Upload Data File
                    </button>
                  </div>
                )}
              </div>

              {/* Chart Gallery */}
              {savedCharts.length > 0 && (
                <div className="border-bolt-elements-borderColor mt-8 rounded-lg border bg-bolt-elements-background-depth-2 p-6">
                  <h2 className="text-bolt-elements-textPrimary mb-4 text-xl font-semibold">Your Charts</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {savedCharts.map((chart) => (
                      <div
                        key={chart.id}
                        className="border-bolt-elements-borderColor hover:border-bolt-elements-focus rounded-lg border p-4 transition-colors"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <h4 className="text-bolt-elements-textPrimary font-medium">{chart.title}</h4>
                          <span className="text-bolt-elements-textSecondary rounded bg-bolt-elements-background-depth-1 px-2 py-1 text-xs capitalize">
                            {chart.type}
                          </span>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="border-bolt-elements-borderColor mb-3 flex h-40 items-center justify-center rounded border-2 border-dashed bg-bolt-elements-background-depth-1">
                          <div className="text-bolt-elements-textSecondary text-center">
                            <svg className="mx-auto mb-2 size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span className="text-sm">Chart Preview</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-bolt-elements-textSecondary text-xs">
                            {new Date(chart.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button className="border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded border px-2 py-1 text-xs transition-colors hover:bg-bolt-elements-background-depth-3">
                              Edit
                            </button>
                            <button className="rounded bg-bolt-elements-button-primary-background px-2 py-1 text-xs text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover">
                              Export
                            </button>
                          </div>
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
    </div>
  );
}
