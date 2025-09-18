import type { Tool } from 'ai';
import { z } from 'zod';

const recommendChartsDescription = `
Analyze data and recommend appropriate chart types and visualizations based on data characteristics.
This tool applies data visualization best practices to suggest:
- Optimal chart types for different data relationships (line, bar, pie, scatter, etc.)
- Appropriate axes and groupings based on data types
- Color schemes and styling recommendations
- Multiple visualization options ranked by effectiveness
- Reasoning for each recommendation based on data science principles

The tool considers data types, relationships, distribution, and visualization goals to provide intelligent chart recommendations.
`;

export const recommendChartsParameters = z.object({
  dataFileId: z.string().describe('The ID of the analyzed data file'),
  analysisGoal: z.enum(['trends', 'comparison', 'distribution', 'relationship', 'composition', 'overview']).describe('The primary goal of the visualization'),
  targetAudience: z.enum(['executive', 'technical', 'general', 'academic']).optional().describe('Target audience for the visualization (default: general)'),
  maxRecommendations: z.number().min(1).max(10).optional().describe('Maximum number of chart recommendations (default: 5)'),
  includeAdvanced: z.boolean().optional().describe('Whether to include advanced chart types like heatmaps, treemaps (default: false)'),
  dataColumns: z.array(z.string()).optional().describe('Specific columns to focus on for recommendations'),
  excludeChartTypes: z.array(z.string()).optional().describe('Chart types to exclude from recommendations')
});

export const recommendChartsTool: Tool = {
  description: recommendChartsDescription,
  parameters: recommendChartsParameters,
};