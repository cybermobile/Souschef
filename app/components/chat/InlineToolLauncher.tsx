import { useCallback, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@ui/Button';
import type { Id } from '@convex/_generated/dataModel';
import {
  DocumentArrowUpIcon,
  TableCellsIcon,
  RectangleGroupIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { DocumentUploader } from '~/components/document/DocumentUploader';
import { DataUploader, type DataPreview } from '~/components/document/DataUploader';
import { ProcessingStatus } from '~/components/document/ProcessingStatus';
import { TemplateSelector } from '~/components/template/TemplateSelector';
import { ChartBuilder, type DataColumn } from '~/components/charts/ChartBuilder';
import { ReportViewer } from '~/components/reports/ReportViewer';

type InlineTool = 'document' | 'data' | 'templates' | 'charts' | 'reports';

interface InlineToolLauncherProps {
  chatStarted?: boolean;
  className?: string;
}

interface TemplateSummary {
  _id: string;
  templateName: string;
  templateType: string;
  description?: string;
  usageCount: number;
  tags: string[];
  industry?: string;
  createdAt: number;
  approvalStatus: string;
}

const TOOL_DESCRIPTIONS: Record<InlineTool, { title: string; description: string }> = {
  document: {
    title: 'Process a document',
    description: 'Upload PDFs, Word docs, or text files so the assistant can extract structure and context.',
  },
  data: {
    title: 'Ingest tabular data',
    description: 'Drop in CSV or Excel files to preview columns, detect types, and prep data for charting.',
  },
  templates: {
    title: 'Apply a template',
    description: 'Browse recommended business templates and pick one for the assistant to follow.',
  },
  charts: {
    title: 'Design a chart',
    description: 'Map columns to visualize trends and hand the configuration back to the assistant.',
  },
  reports: {
    title: 'Review a report',
    description: 'Preview how generated documents, charts, and insights come together in a final report.',
  },
};

export function InlineToolLauncher({ chatStarted = false, className = '' }: InlineToolLauncherProps) {
  const [activeTool, setActiveTool] = useState<InlineTool | null>(null);
  const [lastDocumentId, setLastDocumentId] = useState<Id<'uploadedDocuments'> | null>(null);
  const [lastDataFileId, setLastDataFileId] = useState<Id<'dataFiles'> | null>(null);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [chartSummary, setChartSummary] = useState<{
    title: string;
    type: string;
    xAxis?: string;
    yAxis?: string;
    aggregation?: string;
  } | null>(null);
  const [generatedChart, setGeneratedChart] = useState<{ data: any; options: any } | null>(null);

  const defaultTemplates = useMemo<TemplateSummary[]>(
    () => [
      {
        _id: 'template_exec_summary',
        templateName: 'Executive Summary Update',
        templateType: 'executive_report',
        description: 'Concise executive summary with highlights, KPIs, and next steps.',
        usageCount: 128,
        tags: ['executive', 'summary', 'leadership'],
        industry: 'general',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        approvalStatus: 'approved',
      },
      {
        _id: 'template_board_report',
        templateName: 'Board Review Packet',
        templateType: 'board_report',
        description: 'Structured update for quarterly board or leadership meetings.',
        usageCount: 82,
        tags: ['board', 'reporting', 'financial'],
        industry: 'finance',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 62,
        approvalStatus: 'approved',
      },
      {
        _id: 'template_client_proposal',
        templateName: 'Client Proposal Narrative',
        templateType: 'proposal',
        description: 'Narrative proposal with scope, pricing, and implementation roadmap.',
        usageCount: 205,
        tags: ['sales', 'proposal', 'go-to-market'],
        industry: 'services',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
        approvalStatus: 'approved',
      },
    ],
    [],
  );

  const defaultSuggestions = useMemo(
    () =>
      defaultTemplates.slice(0, 2).map((template, index) => ({
        templateId: template._id,
        similarityScore: 0.86 + index * 0.04,
        matchReason:
          index === 0
            ? 'Matches recent executive updates with similar KPI language.'
            : 'High overlap with prior board packets referencing quarterly revenue.',
        structureAlignment: 0.9 - index * 0.05,
        contentAlignment: 0.88 - index * 0.03,
      })),
    [defaultTemplates],
  );

  const selectedTemplate = useMemo(
    () => defaultTemplates.find((template) => template._id === selectedTemplateId) ?? null,
    [defaultTemplates, selectedTemplateId],
  );

  const fallbackColumns = useMemo<DataColumn[]>(
    () => [
      {
        name: 'Month',
        type: 'string',
        values: ['January', 'February', 'March', 'April', 'May', 'June'],
      },
      {
        name: 'Revenue',
        type: 'number',
        values: [120_000, 135_000, 142_500, 158_200, 171_400, 185_900],
      },
      {
        name: 'Channel',
        type: 'string',
        values: ['Web', 'Retail', 'Web', 'Partner', 'Web', 'Retail'],
      },
      {
        name: 'Pipeline Velocity',
        type: 'number',
        values: [7.2, 7.6, 8.1, 8.9, 9.4, 10.1],
      },
    ],
    [],
  );

  const chartColumns = useMemo<DataColumn[]>(() => {
    if (!dataPreview) {
      return fallbackColumns;
    }

    return dataPreview.headers.map((header, index) => ({
      name: header || `Column ${index + 1}`,
      type: (dataPreview.columnTypes?.[header] as DataColumn['type']) ?? 'string',
      values: dataPreview.sampleRows.map((row) => row[index] ?? ''),
    }));
  }, [dataPreview, fallbackColumns]);

  const openTool = useCallback((tool: InlineTool) => {
    setActiveTool(tool);
  }, []);

  const closeModal = useCallback(() => setActiveTool(null), []);

  const handleChartConfigChange = useCallback((config: Record<string, any>) => {
    setChartSummary({
      title: config.title,
      type: config.type,
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      aggregation: config.aggregation,
    });
  }, []);

  const handleChartGenerate = useCallback((data: any, options: any) => {
    setGeneratedChart({ data, options });
  }, []);

  const toolButtons: Array<{
    id: InlineTool;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'document',
      label: 'Upload document',
      description: 'Extract content and structure for the agent to reference.',
      icon: DocumentArrowUpIcon,
    },
    {
      id: 'data',
      label: 'Upload data',
      description: 'Profile CSV or Excel files before charting.',
      icon: TableCellsIcon,
    },
    {
      id: 'templates',
      label: 'Match a template',
      description: 'Keep output aligned with approved formats.',
      icon: RectangleGroupIcon,
    },
    {
      id: 'charts',
      label: 'Build a chart',
      description: 'Design the visualization without leaving chat.',
      icon: PresentationChartLineIcon,
    },
    {
      id: 'reports',
      label: 'Preview report',
      description: 'See how documents and charts combine.',
      icon: DocumentChartBarIcon,
    },
  ];

  let modalTitle: string | null = null;
  let modalDescription: string | null = null;
  let modalContent: ReactNode = null;

  if (activeTool) {
    modalTitle = TOOL_DESCRIPTIONS[activeTool].title;
    modalDescription = TOOL_DESCRIPTIONS[activeTool].description;

    switch (activeTool) {
      case 'document':
        modalContent = (
          <div className="space-y-6">
            <DocumentUploader
              className="w-full"
              onUploadComplete={(documentId) => {
                setLastDocumentId(documentId);
              }}
            />
            {lastDocumentId && (
              <ProcessingStatus
                documentId={lastDocumentId}
                showDetails
                className="border-none bg-bolt-elements-background-depth-2"
              />
            )}
          </div>
        );
        break;
      case 'data':
        modalContent = (
          <div className="space-y-6">
            <DataUploader
              className="w-full"
              onUploadComplete={(dataFileId) => {
                setLastDataFileId(dataFileId);
              }}
              onDataPreview={(preview) => {
                setDataPreview(preview);
              }}
            />
            {(dataPreview || lastDataFileId) && (
              <div className="space-y-4">
                {lastDataFileId && (
                  <ProcessingStatus
                    dataFileId={lastDataFileId}
                    showDetails
                    className="border-none bg-bolt-elements-background-depth-2"
                  />
                )}
                {dataPreview && (
                  <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-4">
                    <h3 className="text-bolt-elements-textPrimary text-sm font-semibold">Data preview</h3>
                    <p className="text-bolt-elements-textSecondary mt-1 text-xs">
                      {dataPreview.headers.length} columns · {dataPreview.totalRows} rows detected
                    </p>
                    <div className="mt-3 overflow-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-bolt-elements-background-depth-1">
                          <tr>
                            {dataPreview.headers.map((header) => (
                              <th
                                key={header}
                                className="border-bolt-elements-borderColor whitespace-nowrap border-b px-2 py-1 font-medium"
                              >
                                <div>{header}</div>
                                <div className="text-bolt-elements-textSecondary text-[10px] uppercase tracking-wide">
                                  {dataPreview.columnTypes?.[header] ?? 'string'}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataPreview.sampleRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="odd:bg-bolt-elements-background-depth-1/40">
                              {row.map((value, columnIndex) => (
                                <td
                                  key={`${rowIndex}-${columnIndex}`}
                                  className="text-bolt-elements-textSecondary whitespace-nowrap px-2 py-1"
                                >
                                  {value === null || value === undefined || value === '' ? '—' : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        break;
      case 'templates':
        modalContent = (
          <div className="space-y-4">
            <TemplateSelector
              templates={defaultTemplates}
              suggestedTemplates={defaultSuggestions}
              onTemplateSelect={(templateId) => {
                setSelectedTemplateId(templateId);
              }}
              selectedTemplateId={selectedTemplateId ?? undefined}
            />
            {selectedTemplate && (
              <div className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2 p-4">
                <h3 className="text-bolt-elements-textPrimary text-sm font-semibold">Selected template</h3>
                <p className="text-bolt-elements-textSecondary mt-1 text-xs">{selectedTemplate.description}</p>
                <div className="text-bolt-elements-textSecondary mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
                  <span className="text-bolt-elements-textPrimary rounded-full bg-bolt-elements-background-depth-1 px-2 py-1">
                    {selectedTemplate.templateType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-bolt-elements-textPrimary rounded-full bg-bolt-elements-background-depth-1 px-2 py-1">
                    {selectedTemplate.industry ?? 'General'}
                  </span>
                  <span className="text-bolt-elements-textPrimary rounded-full bg-bolt-elements-background-depth-1 px-2 py-1">
                    {selectedTemplate.tags.slice(0, 2).join(' • ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
        break;
      case 'charts':
        modalContent = (
          <div className="space-y-4">
            <ChartBuilder
              data={chartColumns}
              onConfigChange={handleChartConfigChange}
              onChartGenerate={handleChartGenerate}
            />
            {(chartSummary || generatedChart) && (
              <div className="border-bolt-elements-borderColor text-bolt-elements-textSecondary rounded-lg border bg-bolt-elements-background-depth-2 p-4 text-sm">
                {chartSummary && (
                  <div>
                    <h3 className="text-bolt-elements-textPrimary text-sm font-semibold">Current configuration</h3>
                    <p className="mt-1">
                      {chartSummary.title || 'Untitled chart'} · {chartSummary.type} chart
                      {chartSummary.xAxis ? ` · X: ${chartSummary.xAxis}` : ''}
                      {chartSummary.yAxis ? ` · Y: ${chartSummary.yAxis}` : ''}
                      {chartSummary.aggregation ? ` · ${chartSummary.aggregation}` : ''}
                    </p>
                  </div>
                )}
                {generatedChart && (
                  <p className="mt-3 text-xs">
                    Chart data prepared — ready to insert into the conversation or final report.
                  </p>
                )}
              </div>
            )}
          </div>
        );
        break;
      case 'reports':
        modalContent = (
          <div className="space-y-4">
            <ReportViewer className="border-bolt-elements-borderColor rounded-lg border bg-bolt-elements-background-depth-2" />
            <p className="text-bolt-elements-textSecondary text-xs">
              Use the inline report preview to confirm structure before asking the assistant to export or distribute it.
            </p>
          </div>
        );
        break;
      default:
        modalContent = null;
    }
  }

  return (
    <div
      className={`border-bolt-elements-borderColor rounded-2xl border bg-bolt-elements-background-depth-2 p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-bolt-elements-textSecondary text-sm font-semibold uppercase tracking-wide">
            Document tools
          </h3>
          <p className="text-bolt-elements-textSecondary/80 text-xs">
            {chatStarted
              ? 'Keep uploads, templates, charts, and reports inside the conversation.'
              : 'Set up documents and data sources before kicking off the conversation.'}
          </p>
        </div>
        {(lastDocumentId || dataPreview || selectedTemplate || chartSummary) && (
          <Button
            variant="neutral"
            inline
            size="xs"
            icon={<ArrowPathIcon className="size-3" />}
            onClick={() => {
              setLastDocumentId(null);
              setLastDataFileId(null);
              setDataPreview(null);
              setSelectedTemplateId(null);
              setChartSummary(null);
              setGeneratedChart(null);
            }}
          >
            Reset workspace
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {toolButtons.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => openTool(tool.id)}
              className="border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/60 hover:border-bolt-elements-borderColor/80 group flex h-full flex-col rounded-xl border p-3 text-left transition hover:bg-bolt-elements-background-depth-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-bolt-elements-textSecondary group-hover:text-bolt-elements-textPrimary flex size-9 items-center justify-center rounded-lg bg-bolt-elements-background-depth-2 transition">
                  <Icon className="size-4" />
                </span>
                <span className="text-bolt-elements-textPrimary text-sm font-semibold">{tool.label}</span>
              </div>
              <p className="text-bolt-elements-textSecondary mt-3 text-xs">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {(lastDocumentId || dataPreview || selectedTemplate || chartSummary) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {lastDocumentId && (
            <div className="border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/60 text-bolt-elements-textSecondary rounded-lg border p-3 text-xs">
              <h4 className="text-bolt-elements-textPrimary text-sm font-semibold">Latest document</h4>
              <p className="mt-1">Processed document ready for inline referencing.</p>
            </div>
          )}
          {dataPreview && (
            <div className="border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/60 text-bolt-elements-textSecondary rounded-lg border p-3 text-xs">
              <h4 className="text-bolt-elements-textPrimary text-sm font-semibold">Data profile captured</h4>
              <p className="mt-1">{dataPreview.headers.length} columns detected for visualization.</p>
            </div>
          )}
          {selectedTemplate && (
            <div className="border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/60 text-bolt-elements-textSecondary rounded-lg border p-3 text-xs">
              <h4 className="text-bolt-elements-textPrimary text-sm font-semibold">Template locked</h4>
              <p className="mt-1">{selectedTemplate.templateName}</p>
            </div>
          )}
          {chartSummary && (
            <div className="border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/60 text-bolt-elements-textSecondary rounded-lg border p-3 text-xs">
              <h4 className="text-bolt-elements-textPrimary text-sm font-semibold">Chart configured</h4>
              <p className="mt-1">{chartSummary.title || `${chartSummary.type} chart`} ready to drop into the draft.</p>
            </div>
          )}
        </div>
      )}

      <Dialog.Root open={activeTool !== null} onOpenChange={(open) => !open && closeModal()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="border-bolt-elements-borderColor max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border bg-bolt-elements-background-depth-1 shadow-xl">
              <div className="border-bolt-elements-borderColor flex items-start justify-between border-b px-6 py-4">
                <div>
                  <Dialog.Title className="text-bolt-elements-textPrimary text-lg font-semibold">
                    {modalTitle}
                  </Dialog.Title>
                  {modalDescription && (
                    <Dialog.Description className="text-bolt-elements-textSecondary text-sm">
                      {modalDescription}
                    </Dialog.Description>
                  )}
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="text-bolt-elements-textSecondary hover:border-bolt-elements-borderColor hover:text-bolt-elements-textPrimary rounded-full border border-transparent bg-bolt-elements-background-depth-2 p-2 transition"
                    aria-label="Close"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </Dialog.Close>
              </div>
              <div className="max-h-[calc(90vh-6rem)] overflow-y-auto p-6">{modalContent}</div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
