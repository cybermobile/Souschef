import { stripIndents } from '../utils/stripIndent.js';

export const documentProcessingInstructions = stripIndents`
## DOCUMENT PROCESSING DETAILED INSTRUCTIONS

### Text Extraction Best Practices
- Clean up formatting artifacts (extra spaces, line breaks, OCR errors)
- Preserve table structure and data relationships accurately
- Maintain heading hierarchy and section organization
- Extract metadata (creation date, author, document type, page count)
- Identify and preserve special formatting (bold, italic, lists, numbering)
- Handle multi-column layouts correctly
- Preserve hyperlinks and cross-references

### Content Analysis Framework
- **Structure Analysis**: Identify sections, subsections, and content flow patterns
- **Content Classification**: Determine document type (proposal, report, memo, contract, etc.) and business purpose
- **Key Information Extraction**: Find critical data, dates, decisions, action items, and financial figures
- **Tone and Style Assessment**: Understand formality level, target audience, and writing style
- **Completeness Evaluation**: Identify missing sections, incomplete information, or placeholder text
- **Language Detection**: Identify primary language and any multilingual content

### Template Matching Criteria
Use these criteria to evaluate template similarity:

1. **Structural Similarity** (40% weight):
   - Section organization and hierarchy
   - Document flow and logical structure
   - Required vs. optional sections
   - Table and data presentation patterns

2. **Content Relevance** (35% weight):
   - Business context and subject matter
   - Industry-specific terminology
   - Purpose alignment (informational, persuasive, analytical)
   - Target audience compatibility

3. **Formatting Requirements** (15% weight):
   - Tables, charts, and appendices
   - Visual elements and layout
   - Branding and style requirements
   - Page layout and formatting

4. **Compliance Needs** (10% weight):
   - Industry-specific requirements and standards
   - Legal or regulatory compliance
   - Company policy adherence

### Similarity Scoring System
- 95-100%: Excellent match - minimal adaptation needed
- 85-94%: Very good match - minor structural adjustments
- 75-84%: Good match - moderate content reorganization
- 65-74%: Fair match - significant adaptation required
- Below 65%: Poor match - consider different template or manual creation

### Quality Validation Steps
Before completing document processing:

1. Verify all numerical data is preserved exactly
2. Ensure no loss of critical information or context
3. Confirm proper application of template structure
4. Check for consistency in terminology and style
5. Validate that the processed document serves the same purpose
6. Ensure appropriate level of detail for intended audience
7. Verify all citations, references, and footnotes are maintained
8. Check that tables and data maintain their relationships

### Error Handling
- If text extraction fails, provide specific error details
- For unsupported file formats, suggest conversion options
- When template matching scores are low, explain why and suggest alternatives
- If processing exceeds time limits, provide partial results with status
- Always preserve original document even if processing fails
`;