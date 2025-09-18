import { defineTable } from "convex/server";
import { v } from "convex/values";

// Data files table for storing and analyzing CSV/Excel files for visualization
export const dataFiles = defineTable({
  // Organization and user
  companyId: v.string(),
  userId: v.id("convexMembers"),
  sessionId: v.optional(v.id("sessions")), // Link to chat session

  // File information
  fileName: v.string(),
  fileType: v.string(), // csv, xlsx, xls, tsv, json
  fileSize: v.number(), // in bytes
  fileUrl: v.string(), // Convex file storage URL

  // Data structure analysis
  columnHeaders: v.array(v.string()),
  columnTypes: v.array(v.object({
    name: v.string(),
    type: v.string(), // string, number, date, boolean, mixed
    nullable: v.boolean(),
    uniqueCount: v.number(),
    sampleValues: v.array(v.string()), // first 5 unique values
  })),
  rowCount: v.number(),
  columnCount: v.number(),

  // Data preview and statistics
  dataPreview: v.string(), // JSON string of first 10 rows
  dataStatistics: v.optional(v.object({
    numericColumns: v.array(v.object({
      name: v.string(),
      min: v.number(),
      max: v.number(),
      mean: v.number(),
      median: v.number(),
      standardDeviation: v.number(),
      nullCount: v.number(),
    })),
    categoricalColumns: v.array(v.object({
      name: v.string(),
      uniqueValues: v.number(),
      topValues: v.array(v.object({
        value: v.string(),
        count: v.number(),
        percentage: v.number(),
      })),
      nullCount: v.number(),
    })),
    dateColumns: v.array(v.object({
      name: v.string(),
      earliest: v.string(),
      latest: v.string(),
      nullCount: v.number(),
    })),
  })),

  // Data quality assessment
  dataQuality: v.optional(v.object({
    completeness: v.number(), // percentage of non-null values
    consistency: v.number(), // data type consistency score
    validity: v.number(), // valid values score
    overallScore: v.number(), // combined quality score 0-100
    issues: v.array(v.object({
      type: v.string(), // missing_data, inconsistent_type, outlier, etc.
      severity: v.string(), // low, medium, high
      description: v.string(),
      affectedColumns: v.array(v.string()),
      affectedRows: v.optional(v.number()),
    })),
  })),

  // Schema embedding for similarity matching with other datasets
  schemaDescription: v.string(), // Natural language description of data structure
  schemaEmbedding: v.array(v.float64()),

  // Chart recommendations
  suggestedCharts: v.optional(v.array(v.object({
    chartType: v.string(), // line, bar, scatter, pie, heatmap, etc.
    confidence: v.number(), // 0-1 confidence score
    reasoning: v.string(), // why this chart type is recommended
    config: v.object({ // chart configuration
      title: v.string(),
      xAxis: v.optional(v.string()),
      yAxis: v.optional(v.string()),
      series: v.optional(v.array(v.string())),
      aggregation: v.optional(v.string()), // sum, average, count, etc.
    }),
    insightsPotential: v.number(), // 0-1 score for potential insights
  }))),

  // Detected patterns and insights
  detectedPatterns: v.optional(v.array(v.object({
    type: v.string(), // trend, seasonality, correlation, anomaly, etc.
    description: v.string(),
    confidence: v.number(),
    affectedColumns: v.array(v.string()),
    visualization: v.optional(v.string()), // recommended viz for this pattern
  }))),

  // Processing status
  processingStatus: v.string(), // uploaded, parsing, analyzing, completed, failed
  processingProgress: v.number(), // 0-100
  errorMessage: v.optional(v.string()),

  // Timestamps
  uploadedAt: v.number(),
  processedAt: v.optional(v.number()),

  // Related entities
  linkedDocumentId: v.optional(v.id("uploadedDocuments")), // if data relates to a document
  generatedReportIds: v.optional(v.array(v.id("generatedReports"))), // reports using this data
})
.index("byCompanyAndUser", ["companyId", "userId"])
.index("bySession", ["sessionId"])
.index("byProcessingStatus", ["processingStatus", "companyId"])
.index("byUploadDate", ["uploadedAt"])
.vectorIndex("by_schema_embedding", {
  vectorField: "schemaEmbedding",
  dimensions: 1536,
  filterFields: ["companyId", "userId", "processingStatus", "fileType"],
});