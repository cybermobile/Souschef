import { defineTable } from "convex/server";
import { v } from "convex/values";

// Generated reports table for storing combined documents with visualizations
export const generatedReports = defineTable({
  // Organization and user
  companyId: v.string(),
  userId: v.id("convexMembers"),
  sessionId: v.optional(v.id("sessions")), // Link to chat session

  // Report identification
  reportName: v.string(),
  reportType: v.string(), // document_rewrite, data_visualization, combined_report, executive_summary
  reportDescription: v.optional(v.string()),

  // Source references
  sourceDocumentIds: v.optional(v.array(v.id("uploadedDocuments"))),
  sourceDataFileIds: v.optional(v.array(v.id("dataFiles"))),
  templateId: v.optional(v.id("documentTemplates")),

  // Report structure and content
  content: v.object({
    // Main report content (HTML or markdown)
    body: v.string(),

    // Report sections
    sections: v.array(v.object({
      id: v.string(),
      title: v.string(),
      content: v.string(),
      order: v.number(),
      type: v.string(), // text, chart, table, image
      chartId: v.optional(v.string()), // reference to chart in charts array
    })),

    // Executive summary
    executiveSummary: v.optional(v.string()),

    // Key findings/insights
    keyFindings: v.optional(v.array(v.object({
      finding: v.string(),
      importance: v.string(), // high, medium, low
      supportingData: v.optional(v.string()),
    }))),

    // Recommendations
    recommendations: v.optional(v.array(v.object({
      recommendation: v.string(),
      priority: v.string(), // high, medium, low
      expectedImpact: v.optional(v.string()),
      implementation: v.optional(v.string()),
    }))),
  }),

  // Embedded visualizations
  charts: v.array(v.object({
    chartId: v.string(),
    chartType: v.string(), // line, bar, scatter, pie, etc.
    title: v.string(),
    description: v.optional(v.string()),
    config: v.string(), // JSON chart configuration
    data: v.string(), // JSON chart data
    insights: v.optional(v.array(v.string())), // auto-generated insights
    imageUrl: v.optional(v.string()), // static image version for exports
  })),

  // Tables and data
  tables: v.optional(v.array(v.object({
    tableId: v.string(),
    title: v.string(),
    headers: v.array(v.string()),
    data: v.string(), // JSON array of row data
    formatting: v.optional(v.string()), // JSON formatting rules
  }))),

  // Report metadata
  metadata: v.object({
    author: v.optional(v.string()),
    createdDate: v.number(),
    lastModified: v.number(),
    version: v.string(),
    confidentiality: v.optional(v.string()), // public, internal, confidential
    department: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.array(v.string()),
  }),

  // Export and formatting options
  formatting: v.object({
    theme: v.string(), // professional, modern, minimal, corporate
    colorScheme: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    includePageNumbers: v.boolean(),
    includeTOC: v.boolean(), // table of contents
    includeHeader: v.boolean(),
    includeFooter: v.boolean(),
    logoUrl: v.optional(v.string()),
  }),

  // Export URLs for different formats
  exports: v.optional(v.object({
    pdf: v.optional(v.object({
      url: v.string(),
      generatedAt: v.number(),
      size: v.number(),
    })),
    docx: v.optional(v.object({
      url: v.string(),
      generatedAt: v.number(),
      size: v.number(),
    })),
    pptx: v.optional(v.object({
      url: v.string(),
      generatedAt: v.number(),
      size: v.number(),
    })),
    html: v.optional(v.object({
      url: v.string(),
      generatedAt: v.number(),
      size: v.number(),
    })),
  })),

  // Generation status
  generationStatus: v.string(), // draft, generating, reviewing, completed, failed
  generationProgress: v.number(), // 0-100
  errorMessage: v.optional(v.string()),

  // Sharing and collaboration
  shareSettings: v.optional(v.object({
    isPublic: v.boolean(),
    shareCode: v.optional(v.string()), // unique share code
    allowedUsers: v.array(v.id("convexMembers")),
    allowedEmails: v.optional(v.array(v.string())), // for external sharing
    permissions: v.string(), // view, comment, edit
    expiresAt: v.optional(v.number()),
    password: v.optional(v.string()), // hashed password for protection
  })),

  // Analytics
  viewCount: v.number(),
  downloadCount: v.number(),
  lastViewedAt: v.optional(v.number()),
  viewHistory: v.optional(v.array(v.object({
    viewerId: v.optional(v.id("convexMembers")),
    viewedAt: v.number(),
    duration: v.optional(v.number()), // seconds spent viewing
  }))),

  // Approval workflow
  approvalStatus: v.optional(v.string()), // draft, pending_review, approved, rejected
  approvedBy: v.optional(v.id("convexMembers")),
  approvalComments: v.optional(v.string()),
  approvalDate: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  lastModified: v.number(),
  publishedAt: v.optional(v.number()),
})
.index("byCompanyAndUser", ["companyId", "userId"])
.index("bySession", ["sessionId"])
.index("byReportType", ["reportType", "companyId"])
.index("byGenerationStatus", ["generationStatus", "companyId"])
.index("byCreatedDate", ["createdAt"])
.index("byShareCode", ["shareSettings.shareCode"]);