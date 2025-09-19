"use node";

import { Buffer } from "node:buffer";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export const processDataFile = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    companyId: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    sampleSize: v.optional(v.number()),
    detectTypes: v.optional(v.boolean()),
    findCorrelations: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    dataFileId?: Id<"dataFiles">;
    headers?: string[];
    rowCount?: number;
    analysis?: any;
    correlations?: any;
    sampleData?: any[];
    error?: string;
  }> => {
    try {
      const processingStart = Date.now();
      const member = await ctx.runQuery(internal.sessions.getCurrentMemberForActions, {});
      const storedFile = await ctx.storage.get(args.storageId);
      if (!storedFile) {
        throw new Error("Unable to read uploaded data file from storage");
      }

      const arrayBuffer =
        storedFile instanceof ArrayBuffer
          ? storedFile
          : storedFile instanceof Blob
            ? await storedFile.arrayBuffer()
            : null;

      if (!arrayBuffer) {
        throw new Error("Unable to decode uploaded data file");
      }

      const buffer = Buffer.from(arrayBuffer);
      let parsedData: any[] = [];
      let headers: string[] = [];

      // Parse data based on file type
      if (args.fileType === "text/csv" || args.fileName.endsWith('.csv')) {
        // CSV processing with papaparse
        const Papa = await import("papaparse");
        const text = new TextDecoder().decode(buffer);
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          transformHeader: (header: string) => header.trim(),
        });
        parsedData = parsed.data;
        headers = parsed.meta.fields || [];
      } else if (args.fileName.endsWith('.xlsx') || args.fileName.endsWith('.xls')) {
        // Excel processing with xlsx
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          headers = (jsonData[0] as any[]).map(h => String(h).trim());
          parsedData = (jsonData.slice(1) as any[][]).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        }
      } else {
        throw new Error(`Unsupported file type: ${args.fileType}`);
      }

      // Limit sample size for analysis
      const sampleSize = args.sampleSize || Math.min(1000, parsedData.length);
      const sampleData = parsedData.slice(0, sampleSize);

      // Analyze data structure and types
      const analysis = analyzeDataStructure(sampleData, headers, args.detectTypes !== false);

      // Find correlations if requested
      let correlations = null;
      if (args.findCorrelations !== false) {
        correlations = findCorrelations(sampleData, analysis.columns);
      }

      // Convert analysis to match schema format
      const columnTypes = analysis.columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: col.nullValues > 0,
        uniqueCount: col.uniqueValues,
        sampleValues: col.samples.map(s => String(s)),
      }));

      // Store processed data file
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      if (!fileUrl) {
        throw new Error("Unable to generate storage URL for uploaded data file");
      }
      const completedAt = Date.now();
      const dataFileId = await ctx.runMutation(api.mutations.dataFiles.create, {
        companyId: args.companyId ?? member.cachedProfile?.id ?? member._id,
        userId: member._id,
        sessionId: args.sessionId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize ?? buffer.byteLength,
        fileUrl,
        columnHeaders: headers,
        columnTypes,
        rowCount: parsedData.length,
        columnCount: headers.length,
        dataPreview: JSON.stringify(sampleData.slice(0, 10)),
        dataStatistics: analysis.summary,
        schemaDescription: `Dataset with ${headers.length} columns and ${parsedData.length} rows`,
        schemaEmbedding: [], // Would generate embedding for schema
        processingStatus: "completed",
        processingProgress: 100,
        uploadedAt: processingStart,
        processedAt: completedAt,
      });

      return {
        success: true,
        dataFileId,
        headers,
        rowCount: parsedData.length,
        analysis,
        correlations,
        sampleData: sampleData.slice(0, 10), // Return first 10 rows for preview
      };

    } catch (error) {
      console.error("Data processing error:", error);

      // Note: Cannot update status here without dataFileId - would need to be handled differently

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

function analyzeDataStructure(data: any[], headers: string[], detectTypes: boolean) {
  const analysis = {
    columns: [] as Array<{
      name: string;
      type: 'string' | 'number' | 'date' | 'boolean' | 'mixed';
      uniqueValues: number;
      nullValues: number;
      stats?: {
        min?: number;
        max?: number;
        mean?: number;
        median?: number;
        mode?: any;
        stdDev?: number;
      };
      samples: any[];
    }>,
    summary: {
      totalRows: data.length,
      totalColumns: headers.length,
      numericColumns: 0,
      categoricalColumns: 0,
      dateColumns: 0,
    },
  };

  headers.forEach(header => {
    const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(values);
    const nullValues = data.length - values.length;

    let type: 'string' | 'number' | 'date' | 'boolean' | 'mixed' = 'string';
    let stats: any = {};

    if (detectTypes && values.length > 0) {
      // Type detection
      const numericValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)));
      const dateValues = values.filter(v => !isNaN(Date.parse(String(v))));
      const booleanValues = values.filter(v =>
        typeof v === 'boolean' ||
        ['true', 'false', 'yes', 'no', '1', '0'].includes(String(v).toLowerCase())
      );

      if (numericValues.length / values.length > 0.8) {
        type = 'number';
        analysis.summary.numericColumns++;

        // Calculate statistics for numeric columns
        const numbers = numericValues.map(v => Number(v)).filter(n => !isNaN(n));
        if (numbers.length > 0) {
          numbers.sort((a, b) => a - b);
          stats = {
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            mean: numbers.reduce((sum, n) => sum + n, 0) / numbers.length,
            median: numbers[Math.floor(numbers.length / 2)],
            stdDev: Math.sqrt(numbers.reduce((sum, n) => sum + Math.pow(n - stats.mean, 2), 0) / numbers.length),
          };
        }
      } else if (dateValues.length / values.length > 0.6) {
        type = 'date';
        analysis.summary.dateColumns++;
      } else if (booleanValues.length / values.length > 0.8) {
        type = 'boolean';
        analysis.summary.categoricalColumns++;
      } else if (uniqueValues.size < values.length * 0.5) {
        type = 'string'; // Categorical
        analysis.summary.categoricalColumns++;

        // Find mode for categorical data
        const frequency: { [key: string]: number } = {};
        values.forEach(v => {
          const key = String(v);
          frequency[key] = (frequency[key] || 0) + 1;
        });
        stats.mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
      }
    }

    analysis.columns.push({
      name: header,
      type,
      uniqueValues: uniqueValues.size,
      nullValues,
      stats: Object.keys(stats).length > 0 ? stats : undefined,
      samples: Array.from(uniqueValues).slice(0, 5), // First 5 unique values as samples
    });
  });

  return analysis;
}

function findCorrelations(data: any[], columns: any[]) {
  const numericColumns = columns.filter(col => col.type === 'number');
  const correlations: Array<{
    column1: string;
    column2: string;
    correlation: number;
    strength: 'weak' | 'moderate' | 'strong';
  }> = [];

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i].name;
      const col2 = numericColumns[j].name;

      const pairs = data
        .map(row => [Number(row[col1]), Number(row[col2])])
        .filter(([a, b]) => !isNaN(a) && !isNaN(b));

      if (pairs.length < 2) continue;

      const correlation = calculatePearsonCorrelation(pairs);
      const absCorr = Math.abs(correlation);

      let strength: 'weak' | 'moderate' | 'strong' = 'weak';
      if (absCorr > 0.7) strength = 'strong';
      else if (absCorr > 0.4) strength = 'moderate';

      if (absCorr > 0.3) { // Only include notable correlations
        correlations.push({
          column1: col1,
          column2: col2,
          correlation: Math.round(correlation * 1000) / 1000,
          strength,
        });
      }
    }
  }

  return correlations;
}

function calculatePearsonCorrelation(pairs: number[][]): number {
  const n = pairs.length;
  if (n === 0) return 0;

  const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
  const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
  const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
  const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
  const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}