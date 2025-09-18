import { defineTable } from "convex/server";
import { v } from "convex/values";

// Document templates table for storing company templates with embeddings for similarity search
export const documentTemplates = defineTable({
  // Company/organization identifier
  companyId: v.string(),

  // Template identification
  templateName: v.string(),
  templateType: v.string(), // proposal, report, memo, contract, presentation, etc.
  description: v.optional(v.string()),

  // Template content
  content: v.string(), // Original template content
  extractedText: v.string(), // Clean text for embedding generation
  structure: v.string(), // JSON representation of document structure (sections, formatting, etc.)

  // Vector embedding for similarity search (using OpenAI embeddings - 1536 dimensions)
  embedding: v.array(v.float64()),

  // File storage
  fileUrl: v.optional(v.string()), // Convex file storage URL for original template file

  // Metadata
  createdBy: v.id("convexMembers"),
  createdAt: v.number(),
  updatedAt: v.number(),

  // Status and permissions
  isActive: v.boolean(),
  permissions: v.array(v.string()), // roles that can use this template
  usageCount: v.number(),

  // Categorization
  tags: v.array(v.string()),
  industry: v.optional(v.string()), // financial, healthcare, technology, etc.

  // Approval workflow
  approvalStatus: v.string(), // draft, pending, approved, rejected
  approvedBy: v.optional(v.id("convexMembers")),
  approvedAt: v.optional(v.number()),

  // Template requirements
  requiredSections: v.optional(v.array(v.string())), // sections that must be filled
  variableFields: v.optional(v.array(v.object({
    name: v.string(),
    type: v.string(), // text, date, number, etc.
    required: v.boolean(),
    defaultValue: v.optional(v.string()),
  }))),
})
.index("byCompany", ["companyId", "isActive"])
.index("byType", ["templateType", "companyId"])
.index("byApprovalStatus", ["approvalStatus", "companyId"])
.vectorIndex("by_content_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["companyId", "templateType", "isActive", "approvalStatus"],
});