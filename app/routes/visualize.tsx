import { json } from '@vercel/remix';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ChartBuilder } from '~/components/charts/ChartBuilder';
import { DataUploader } from '~/components/document/DataUploader';

export const meta: MetaFunction = () => {
  return [
    { title: 'Data Visualization | SousChef' },
    { name: 'description', content: 'Create beautiful charts and visualizations from your data' },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
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
          { name: 'Profit_Margin', type: 'number', values: [] }
        ]
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
          { name: 'Cost', type: 'number', values: [] }
        ]
      }
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
          chartType: 'line'
        },
        createdAt: Date.now() - 3600000
      },
      {
        id: '2',
        title: 'Revenue by Region',
        type: 'bar',
        dataFileId: '1',
        config: {
          xAxis: 'Region',
          yAxis: 'Revenue',
          chartType: 'bar'
        },
        createdAt: Date.now() - 7200000
      }
    ],
    chartRecommendations: [
      {
        chartType: 'line',
        confidence: 0.9,
        title: 'Sales Trend Over Time',
        reasoning: 'Time series data is best visualized with line charts to show trends',
        config: { xAxis: 'Date', yAxis: 'Sales' }
      },
      {
        chartType: 'pie',
        confidence: 0.8,
        title: 'Market Share by Region',
        reasoning: 'Categorical data showing parts of a whole works well with pie charts',
        config: { xAxis: 'Region', yAxis: 'Revenue' }
      }
    ]
  });
};

export default function Visualize() {
  const { dataFiles, savedCharts, chartRecommendations } = useLoaderData<typeof loader>();

  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary">Data Visualization Workspace</h1>
            <p className="mt-2 text-bolt-elements-textSecondary">
              Upload data, build interactive charts, and create compelling visualizations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Data Sources Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Data Upload */}
                <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                  <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Upload Data</h3>
                  <ClientOnly>
                    {() => (
                      <DataUploader
                        onUpload={(file, data) => {
                          console.log('Data uploaded:', file, data);
                          // TODO: Handle data upload
                        }}
                        className="mb-4"
                      />
                    )}
                  </ClientOnly>
                </div>

                {/* Data Files */}
                <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                  <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Your Data Files</h3>
                  <div className="space-y-3">
                    {dataFiles.map((file) => (
                      <div key={file.id} className="p-3 border border-bolt-elements-borderColor rounded-lg hover:bg-bolt-elements-background-depth-3 cursor-pointer transition-colors">
                        <h4 className="font-medium text-bolt-elements-textPrimary text-sm">{file.fileName}</h4>
                        <div className="text-xs text-bolt-elements-textSecondary mt-1">
                          {file.rowCount.toLocaleString()} rows • {file.columnCount} columns
                        </div>
                        <div className="text-xs text-bolt-elements-textSecondary">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Charts */}
                <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                  <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Saved Charts</h3>
                  <div className="space-y-3">
                    {savedCharts.map((chart) => (
                      <div key={chart.id} className="p-3 border border-bolt-elements-borderColor rounded-lg hover:bg-bolt-elements-background-depth-3 cursor-pointer transition-colors">
                        <h4 className="font-medium text-bolt-elements-textPrimary text-sm">{chart.title}</h4>
                        <div className="text-xs text-bolt-elements-textSecondary mt-1 capitalize">
                          {chart.type} chart
                        </div>
                        <div className="text-xs text-bolt-elements-textSecondary">
                          {new Date(chart.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Recommendations */}
                <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                  <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    {chartRecommendations.map((rec, index) => (
                      <div key={index} className="p-3 border border-bolt-elements-focus/20 bg-bolt-elements-focus/5 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-bolt-elements-textPrimary text-sm">{rec.title}</h4>
                          <span className="px-2 py-1 bg-bolt-elements-focus/20 text-bolt-elements-focus text-xs rounded-full">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-bolt-elements-textSecondary mb-2">{rec.reasoning}</p>
                        <button className="text-xs text-bolt-elements-focus hover:underline">
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
              <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-2">Chart Builder</h2>
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
                  <div className="text-center py-12">
                    <div className="text-bolt-elements-textSecondary mb-4">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">No Data Available</h3>
                      <p className="text-bolt-elements-textSecondary">
                        Upload a CSV or Excel file to start creating visualizations
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-lg font-medium">
                      Upload Data File
                    </button>
                  </div>
                )}
              </div>

              {/* Chart Gallery */}
              {savedCharts.length > 0 && (
                <div className="mt-8 bg-bolt-elements-background-depth-2 rounded-lg p-6 border border-bolt-elements-borderColor">
                  <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Your Charts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedCharts.map((chart) => (
                      <div key={chart.id} className="border border-bolt-elements-borderColor rounded-lg p-4 hover:border-bolt-elements-focus transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-bolt-elements-textPrimary">{chart.title}</h4>
                          <span className="px-2 py-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs rounded capitalize">
                            {chart.type}
                          </span>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="h-40 bg-bolt-elements-background-depth-1 rounded border-2 border-dashed border-bolt-elements-borderColor flex items-center justify-center mb-3">
                          <div className="text-center text-bolt-elements-textSecondary">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm">Chart Preview</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-bolt-elements-textSecondary">
                            {new Date(chart.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 text-xs border border-bolt-elements-borderColor text-bolt-elements-textPrimary rounded hover:bg-bolt-elements-background-depth-3 transition-colors">
                              Edit
                            </button>
                            <button className="px-2 py-1 text-xs bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded">
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