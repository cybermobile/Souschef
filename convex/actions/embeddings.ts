"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const generateEmbedding = action({
  args: {
    text: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const model = args.model || "text-embedding-3-small";

      // Clean and truncate text for embedding
      const cleanText = args.text
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000); // OpenAI embedding limit

      if (cleanText.length === 0) {
        throw new Error("Text content is empty after cleaning");
      }

      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: cleanText,
          model: model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error("Invalid response from OpenAI embeddings API");
      }

      return {
        success: true,
        embedding: data.data[0].embedding,
        model: model,
        usage: data.usage,
        textLength: cleanText.length,
      };

    } catch (error) {
      console.error("Embedding generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const generateBatchEmbeddings = action({
  args: {
    texts: v.array(v.string()),
    model: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const batchSize = args.batchSize || parseInt(process.env.EMBEDDING_BATCH_SIZE || "10");
      const results: Array<{
        index: number;
        embedding?: number[];
        error?: string;
      }> = [];

      // Process in batches to avoid rate limits
      for (let i = 0; i < args.texts.length; i += batchSize) {
        const batch = args.texts.slice(i, i + batchSize);
        const batchPromises = batch.map(async (text, batchIndex) => {
          const globalIndex = i + batchIndex;
          try {
            const result = await ctx.runAction(api.actions.embeddings.generateEmbedding, {
              text,
              model: args.model,
            });

            if (result.success) {
              return {
                index: globalIndex,
                embedding: result.embedding,
              };
            } else {
              return {
                index: globalIndex,
                error: result.error,
              };
            }
          } catch (error) {
            return {
              index: globalIndex,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to respect rate limits
        if (i + batchSize < args.texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successful = results.filter(r => r.embedding);
      const failed = results.filter(r => r.error);

      return {
        success: true,
        total: args.texts.length,
        successful: successful.length,
        failed: failed.length,
        results,
      };

    } catch (error) {
      console.error("Batch embedding generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const findSimilarDocuments = action({
  args: {
    queryEmbedding: v.array(v.float64()),
    companyId: v.string(),
    limit: v.optional(v.number()),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Use Convex vector search to find similar documents
      const results = await ctx.vectorSearch("documentTemplates", "by_content_embedding", {
        vector: args.queryEmbedding,
        limit: args.limit || 10,
        filter: (q) => q.eq("companyId", args.companyId),
      });

      const threshold = args.threshold || 0.7;
      const filteredResults = results.filter(result => result._score >= threshold);

      return {
        success: true,
        results: filteredResults.map(result => ({
          id: result._id,
          score: result._score,
          // Note: These fields would need to be added to vector search results
          // or fetched via a separate query
          templateName: "Template",
          documentType: "Document",
          lastUpdated: Date.now(),
        })),
        total: filteredResults.length,
        threshold,
      };

    } catch (error) {
      console.error("Similar documents search error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});