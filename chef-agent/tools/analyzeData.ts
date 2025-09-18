import type { Tool } from 'ai';
import { z } from 'zod';

const analyzeDataDescription = `
Analyze uploaded data files (CSV, Excel) to understand structure, detect patterns, and provide insights.
This tool performs comprehensive data analysis including:
- Column type detection (string, number, date, boolean, categorical)
- Statistical analysis (mean, median, mode, standard deviation, quartiles)
- Data quality assessment (missing values, duplicates, outliers)
- Pattern recognition (trends, correlations, seasonal patterns)
- Categorical data analysis (frequency distributions, unique values)
- Data relationships and dependencies
- Recommendations for data cleaning and preparation

Results are stored in the dataFiles table with analysis metadata and insights.
`;

export const analyzeDataParameters = z.object({
  fileId: z.string().describe('The ID of the uploaded data file to analyze'),
  fileName: z.string().describe('The name of the data file'),
  companyId: z.string().describe('The company ID for organizing data files'),
  sampleSize: z.number().min(10).max(10000).optional().describe('Number of rows to analyze for large datasets (default: 1000)'),
  detectTypes: z.boolean().optional().describe('Whether to automatically detect column data types (default: true)'),
  findCorrelations: z.boolean().optional().describe('Whether to analyze correlations between numeric columns (default: true)'),
  identifyOutliers: z.boolean().optional().describe('Whether to identify statistical outliers (default: true)'),
  generateSummary: z.boolean().optional().describe('Whether to generate a natural language summary of findings (default: true)')
});

export const analyzeDataTool: Tool = {
  description: analyzeDataDescription,
  parameters: analyzeDataParameters,
};