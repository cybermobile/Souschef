import type { Tool } from 'ai';
import { z } from 'zod';

const generateReportDescription = `
Generate comprehensive reports by combining document content, data analysis, and visualizations.
This tool creates professional reports that include:
- Executive summary with key findings and insights
- Document content organized by sections and topics
- Integrated charts and data visualizations
- Statistical analysis and data interpretation
- Conclusions and recommendations
- Formatted output in multiple formats (PDF, Word, HTML)

The generated report combines multiple data sources and provides a cohesive narrative with supporting visualizations.
`;

export const generateReportParameters = z.object({
  reportTitle: z.string().describe('The title of the report to generate'),
  companyId: z.string().describe('The company ID for organizing reports'),
  documentIds: z.array(z.string()).optional().describe('IDs of documents to include in the report'),
  dataFileIds: z.array(z.string()).optional().describe('IDs of data files to include in analysis'),
  chartConfigs: z.array(z.object({
    chartId: z.string(),
    title: z.string(),
    section: z.string().optional()
  })).optional().describe('Chart configurations to include in the report'),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string().optional(),
    includeCharts: z.boolean().optional()
  })).optional().describe('Custom sections to include in the report'),
  includeExecutiveSummary: z.boolean().optional().describe('Whether to generate an executive summary (default: true)'),
  includeMethodology: z.boolean().optional().describe('Whether to include methodology section (default: false)'),
  outputFormat: z.enum(['pdf', 'docx', 'html', 'markdown']).optional().describe('Report output format (default: pdf)'),
  template: z.string().optional().describe('Report template to apply for consistent formatting')
});

export const generateReportTool: Tool = {
  description: generateReportDescription,
  parameters: generateReportParameters,
};