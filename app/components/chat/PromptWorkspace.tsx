import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@ui/Button';
import type { Id } from '@convex/_generated/dataModel';
import {
  ArrowPathIcon,
  DocumentArrowUpIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { DocumentUploader } from '~/components/document/DocumentUploader';
import { DataUploader, type DataPreview } from '~/components/document/DataUploader';
import { ProcessingStatus } from '~/components/document/ProcessingStatus';
import { TemplateSelector } from '~/components/template/TemplateSelector';
import { ChartBuilder, type DataColumn } from '~/components/charts/ChartBuilder';
import { ReportViewer } from '~/components/reports/ReportViewer';
import { toast } from 'sonner';

type WorkspaceTool = 'document' | 'data' | 'templates' | 'charts' | 'reports';

interface PromptWorkspaceProps {
  chatStarted: boolean;
  sessionId?: Id<'sessions'>;
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

const TOOL_COPY: Record<WorkspaceTool, { title: string; description: string }> = {
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
    description: 'Browse recommended templates and pick one for the assistant to follow.',
  },
  charts: {
    title: 'Design a chart',
    description: 'Map columns to visualize trends and hand the configuration back to the assistant.',
  },
  reports: {
    title: 'Review a report',
    description: 'Preview how generated documents, charts, and insights come together.',
  },
};

export function PromptWorkspace({ chatStarted, sessionId }: PromptWorkspaceProps) {
  const [activeTool, setActiveTool] = useState<WorkspaceTool | null>(null);
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
  const [generatedChart, setGeneratedChart] = useState<{ data: unknown; options: unknown } | null>(null);

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

  const toggleTool = useCallback((tool: WorkspaceTool) => {
    setActiveTool((current) => (current === tool ? null : tool));
  }, []);

  useEffect(() => {
    if (chatStarted) {
      setActiveTool(null);
    }
  }, [chatStarted]);

  const resetWorkspace = useCallback(() => {
    setLastDocumentId(null);
    setLastDataFileId(null);
    setDataPreview(null);
    setSelectedTemplateId(null);
    setChartSummary(null);
    setGeneratedChart(null);
  }, []);

  const handleChartConfigChange = useCallback((config: Record<string, string>) => {
    setChartSummary({
      title: config.title,
      type: config.type,
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      aggregation: config.aggregation,
    });
  }, []);

  const handleChartGenerate = useCallback((data: unknown, options: unknown) => {
    setGeneratedChart({ data, options });
  }, []);

  const hasWorkspaceState = Boolean(
    lastDocumentId || dataPreview || selectedTemplate || chartSummary || generatedChart,
  );

  const tools: Array<{
    id: WorkspaceTool;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }> = [
    { id: 'document', label: 'Upload document', icon: DocumentArrowUpIcon },
    { id: 'data', label: 'Upload data', icon: TableCellsIcon },
    { id: 'templates', label: 'Match a template', icon: RectangleGroupIcon },
    { id: 'charts', label: 'Build a chart', icon: PresentationChartLineIcon },
    { id: 'reports', label: 'Preview report', icon: DocumentChartBarIcon },
  ];

  let activeContent: ReactNode = null;

  if (activeTool === 'document') {
    activeContent = (
      <div className="space-y-4">
        <DocumentUploader
          className="w-full"
          sessionId={sessionId}
          onUploadComplete={(documentId) => {
            setLastDocumentId(documentId);
            toast.success('Document uploaded and ready to reference.');
          }}
          onUploadError={(message) => {
            toast.error(message);
          }}
        />
        {lastDocumentId && (
          <ProcessingStatus documentId={lastDocumentId} showDetails className="bg-background-secondary/60" />
        )}
      </div>
    );
  }

  if (activeTool === 'data') {
    activeContent = (
      <div className="space-y-4">
        <DataUploader
          className="w-full"
          sessionId={sessionId}
          onUploadComplete={(dataFileId) => {
            setLastDataFileId(dataFileId);
            toast.success('Data file ingested for analysis.');
          }}
          onUploadError={(error) => {
            setLastDataFileId(null);
            toast.error(error);
          }}
          onDataPreview={(preview) => {
            setDataPreview(preview);
          }}
        />
        {(dataPreview || lastDataFileId) && (
          <div className="space-y-4">
            {lastDataFileId && (
              <ProcessingStatus dataFileId={lastDataFileId} showDetails className="bg-background-secondary/60" />
            )}
            {dataPreview && (
              <div className="overflow-hidden rounded-lg border bg-background-primary/80">
                <div className="border-b bg-background-secondary/60 px-4 py-2">
                  <h3 className="text-sm font-semibold text-content-primary">Data preview</h3>
                  <p className="text-xs text-content-secondary">
                    {dataPreview.headers.length} columns · {dataPreview.totalRows} rows detected
                  </p>
                </div>
                <div className="max-h-56 overflow-auto px-4 py-3">
                  <table className="min-w-full text-left text-xs text-content-secondary">
                    <thead>
                      <tr>
                        {dataPreview.headers.map((header) => (
                          <th key={header} className="whitespace-nowrap px-2 py-1 text-content-primary">
                            <div>{header}</div>
                            <div className="text-[10px] uppercase tracking-wide">
                              {dataPreview.columnTypes?.[header] ?? 'string'}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.sampleRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-background-secondary/30' : undefined}>
                          {row.map((value, columnIndex) => (
                            <td key={`${rowIndex}-${columnIndex}`} className="whitespace-nowrap px-2 py-1">
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
  }

  if (activeTool === 'templates') {
    activeContent = (
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
          <div className="rounded-lg border bg-background-primary/80 px-4 py-3 text-sm text-content-secondary">
            <h3 className="text-sm font-semibold text-content-primary">Selected template</h3>
            <p className="mt-1 text-xs">{selectedTemplate.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-content-primary">
              <span className="rounded-full bg-background-secondary/60 px-2 py-1">
                {selectedTemplate.templateType.replace(/_/g, ' ')}
              </span>
              <span className="rounded-full bg-background-secondary/60 px-2 py-1">
                {selectedTemplate.industry ?? 'General'}
              </span>
              <span className="rounded-full bg-background-secondary/60 px-2 py-1">
                {selectedTemplate.tags.slice(0, 2).join(' • ')}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTool === 'charts') {
    activeContent = (
      <div className="space-y-4">
        <ChartBuilder
          data={chartColumns}
          onConfigChange={handleChartConfigChange}
          onChartGenerate={handleChartGenerate}
        />
        {(chartSummary || generatedChart) && (
          <div className="rounded-lg border bg-background-primary/80 px-4 py-3 text-sm text-content-secondary">
            {chartSummary && (
              <div>
                <h3 className="text-sm font-semibold text-content-primary">Current configuration</h3>
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
  }

  if (activeTool === 'reports') {
    activeContent = (
      <div className="space-y-4">
        <div className="max-h-96 overflow-hidden rounded-lg border bg-white">
          <ReportViewer className="max-h-96 overflow-y-auto" />
        </div>
        <p className="text-xs text-content-secondary">
          Use the inline report preview to confirm structure before asking the assistant to export or distribute it.
        </p>
      </div>
    );
  }

  const summaryItems: Array<{ icon: ReactNode; label: string; description?: string }> = [];

  if (lastDocumentId) {
    summaryItems.push({
      icon: <DocumentArrowUpIcon className="size-4" />,
      label: 'Document processed',
      description: 'Ready for inline referencing in the next response.',
    });
  }

  if (dataPreview) {
    summaryItems.push({
      icon: <TableCellsIcon className="size-4" />,
      label: 'Data profile captured',
      description: `${dataPreview.headers.length} columns detected for visualization.`,
    });
  }

  if (selectedTemplate) {
    summaryItems.push({
      icon: <RectangleGroupIcon className="size-4" />,
      label: 'Template selected',
      description: selectedTemplate.templateName,
    });
  }

  if (chartSummary) {
    summaryItems.push({
      icon: <PresentationChartLineIcon className="size-4" />,
      label: 'Chart configured',
      description: chartSummary.title || `${chartSummary.type} chart ready to drop into the draft.`,
    });
  }

  return (
    <div className="rounded-t-xl border border-b-0 bg-background-secondary/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary">Workspace preview</p>
          <p className="text-sm text-content-secondary">
            {chatStarted
              ? 'Keep document uploads, templates, charts, and reports tied to this prompt.'
              : 'Prep documents, data, and templates before you send the first message.'}
          </p>
        </div>
        {hasWorkspaceState && (
          <Button
            variant="neutral"
            inline
            size="xs"
            icon={<ArrowPathIcon className="size-3" />}
            onClick={resetWorkspace}
          >
            Reset workspace
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'primary' : 'neutral'}
              inline
              size="xs"
              icon={<Icon className="size-4" />}
              onClick={() => toggleTool(tool.id)}
            >
              {tool.label}
            </Button>
          );
        })}
      </div>

      {activeTool && (
        <div className="mt-4 space-y-3 rounded-lg border border-dashed bg-background-primary/70 p-4">
          <div>
            <h3 className="text-sm font-semibold text-content-primary">{TOOL_COPY[activeTool].title}</h3>
            <p className="text-xs text-content-secondary">{TOOL_COPY[activeTool].description}</p>
          </div>
          {activeContent}
        </div>
      )}

      {summaryItems.length > 0 && (
        <div className="mt-4 grid gap-2 text-sm text-content-secondary sm:grid-cols-2">
          {summaryItems.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-start gap-2 rounded-lg border border-dashed bg-background-primary/70 px-3 py-2"
            >
              <span className="text-content-primary">{item.icon}</span>
              <div className="text-xs">
                <p className="text-sm font-medium text-content-primary">{item.label}</p>
                {item.description && <p className="mt-0.5">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
