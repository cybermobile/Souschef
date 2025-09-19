// Export utilities for different file formats

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'html';

export interface ExportData {
  title: string;
  content: string;
  charts?: any[];
  tables?: any[];
  metadata?: {
    author?: string;
    createdDate?: number;
    department?: string;
  };
}

// Basic HTML export function
export const exportToHTML = (data: ExportData): void => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .content { line-height: 1.6; }
        .chart, .table { margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>

      ${
        data.metadata
          ? `
        <div class="metadata">
          ${data.metadata.author ? `<p><strong>Author:</strong> ${data.metadata.author}</p>` : ''}
          ${data.metadata.department ? `<p><strong>Department:</strong> ${data.metadata.department}</p>` : ''}
          ${data.metadata.createdDate ? `<p><strong>Created:</strong> ${new Date(data.metadata.createdDate).toLocaleDateString()}</p>` : ''}
        </div>
      `
          : ''
      }

      <div class="content">
        ${data.content}
      </div>

      ${
        data.charts && data.charts.length > 0
          ? `
        <div class="charts">
          <h2>Charts and Visualizations</h2>
          ${data.charts
            .map(
              (chart) => `
            <div class="chart">
              <h3>${chart.title || 'Chart'}</h3>
              <p>${chart.description || 'Chart visualization would appear here'}</p>
            </div>
          `,
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        data.tables && data.tables.length > 0
          ? `
        <div class="tables">
          <h2>Data Tables</h2>
          ${data.tables
            .map(
              (table) => `
            <div class="table">
              <h3>${table.title || 'Table'}</h3>
              <table border="1" style="border-collapse: collapse; width: 100%;">
                ${
                  table.headers
                    ? `
                  <thead>
                    <tr>
                      ${table.headers.map((header: string) => `<th style="padding: 8px; background: #f8f9fa;">${header}</th>`).join('')}
                    </tr>
                  </thead>
                `
                    : ''
                }
                <tbody>
                  ${
                    table.data
                      ? table.data
                          .map(
                            (row: any[]) => `
                    <tr>
                      ${row.map((cell) => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
                    </tr>
                  `,
                          )
                          .join('')
                      : ''
                  }
                </tbody>
              </table>
            </div>
          `,
            )
            .join('')}
        </div>
      `
          : ''
      }

      <div class="footer">
        <p>Generated with SousChef Document Platform - ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Basic PDF export function (simplified - would use jsPDF in production)
export const exportToPDF = (data: ExportData): void => {
  // For now, open print dialog which allows saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .metadata { background: #f8f9fa; padding: 15px; margin: 20px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        ${
          data.metadata
            ? `
          <div class="metadata">
            ${data.metadata.author ? `<p><strong>Author:</strong> ${data.metadata.author}</p>` : ''}
            ${data.metadata.department ? `<p><strong>Department:</strong> ${data.metadata.department}</p>` : ''}
          </div>
        `
            : ''
        }
        <div>${data.content}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

// Placeholder functions for Word and PowerPoint export
export const exportToWord = (data: ExportData): void => {
  // In a real implementation, this would use libraries like docx or mammoth
  alert('Word export feature coming soon! For now, you can use HTML export and copy to Word.');
};

export const exportToPowerPoint = (data: ExportData): void => {
  // In a real implementation, this would use libraries like pptxgenjs
  alert('PowerPoint export feature coming soon! For now, you can use HTML export and copy to PowerPoint.');
};

// Main export function that delegates to specific format handlers
export const exportData = (data: ExportData, format: ExportFormat): void => {
  switch (format) {
    case 'html':
      exportToHTML(data);
      break;
    case 'pdf':
      exportToPDF(data);
      break;
    case 'docx':
      exportToWord(data);
      break;
    case 'pptx':
      exportToPowerPoint(data);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Utility function to convert chart data to export-friendly format
export const prepareChartForExport = (chart: any) => {
  return {
    title: chart.title || 'Chart',
    description: chart.description || `${chart.type} chart visualization`,
    type: chart.type,
    data: chart.data,
  };
};

// Utility function to convert table data to export-friendly format
export const prepareTableForExport = (table: any) => {
  return {
    title: table.title || 'Data Table',
    headers: table.headers || [],
    data: table.data || [],
  };
};
