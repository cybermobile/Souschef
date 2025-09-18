import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';

interface Template {
  _id: string;
  templateName: string;
  templateType: string;
  description?: string;
  usageCount: number;
  tags: string[];
  industry?: string;
  createdAt: number;
  approvalStatus: string;
}

interface TemplateSuggestion {
  templateId: string;
  similarityScore: number;
  matchReason: string;
  structureAlignment: number;
  contentAlignment: number;
}

interface TemplateSelectorProps {
  companyId: string;
  suggestedTemplates?: TemplateSuggestion[];
  onTemplateSelect: (templateId: string) => void;
  selectedTemplateId?: string;
  className?: string;
}

// Mock data for development - replace with actual Convex query
const useMockTemplates = (companyId: string): Template[] => {
  // This would be: const templates = useQuery(api.templates.getCompanyTemplates, { companyId });
  return [
    {
      _id: 'template_1',
      templateName: 'Quarterly Business Report',
      templateType: 'report',
      description: 'Comprehensive quarterly business performance report with financial metrics and analysis',
      usageCount: 23,
      tags: ['financial', 'quarterly', 'performance'],
      industry: 'financial',
      createdAt: Date.now() - 86400000,
      approvalStatus: 'approved',
    },
    {
      _id: 'template_2',
      templateName: 'Project Proposal',
      templateType: 'proposal',
      description: 'Standard project proposal template with budget, timeline, and deliverables',
      usageCount: 45,
      tags: ['project', 'proposal', 'budget'],
      createdAt: Date.now() - 172800000,
      approvalStatus: 'approved',
    },
    {
      _id: 'template_3',
      templateName: 'Executive Summary',
      templateType: 'memo',
      description: 'Executive summary template for board presentations and stakeholder updates',
      usageCount: 12,
      tags: ['executive', 'summary', 'board'],
      createdAt: Date.now() - 259200000,
      approvalStatus: 'approved',
    },
    {
      _id: 'template_4',
      templateName: 'Marketing Campaign Report',
      templateType: 'report',
      description: 'Campaign performance analysis with metrics and ROI calculations',
      usageCount: 8,
      tags: ['marketing', 'campaign', 'analytics'],
      industry: 'marketing',
      createdAt: Date.now() - 345600000,
      approvalStatus: 'approved',
    },
  ];
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  companyId,
  suggestedTemplates = [],
  onTemplateSelect,
  selectedTemplateId,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'suggested' | 'browse'>('suggested');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTemplates = useMockTemplates(companyId);

  const templateTypes = useMemo(() => {
    const types = ['all', ...new Set(allTemplates.map(t => t.templateType))];
    return types;
  }, [allTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      const matchesType = selectedType === 'all' || template.templateType === selectedType;
      const matchesSearch = searchQuery === '' ||
        template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [allTemplates, selectedType, searchQuery]);

  const suggestedTemplatesWithData = useMemo(() => {
    return suggestedTemplates.map(suggestion => {
      const template = allTemplates.find(t => t._id === suggestion.templateId);
      return template ? { ...suggestion, template } : null;
    }).filter(Boolean);
  }, [suggestedTemplates, allTemplates]);

  const getMatchQualityColor = (score: number): string => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const renderTemplateCard = (template: Template, suggestion?: TemplateSuggestion) => (
    <div
      key={template._id}
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${selectedTemplateId === template._id
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onTemplateSelect(template._id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{template.templateName}</h3>
          {suggestion && (
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchQualityColor(suggestion.similarityScore)}`}>
                {Math.round(suggestion.similarityScore * 100)}% match
              </span>
              <span className="text-xs text-gray-500">
                AI Recommended
              </span>
            </div>
          )}
        </div>
        {selectedTemplateId === template._id && (
          <div className="flex-shrink-0 ml-3">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {template.description || 'No description available'}
      </p>

      {suggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <p className="text-xs text-blue-800 font-medium mb-1">Why this matches:</p>
          <p className="text-xs text-blue-700">{suggestion.matchReason}</p>
          <div className="flex space-x-4 mt-2 text-xs text-blue-600">
            <span>Structure: {Math.round(suggestion.structureAlignment * 100)}%</span>
            <span>Content: {Math.round(suggestion.contentAlignment * 100)}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="bg-gray-100 px-2 py-1 rounded capitalize">
            {template.templateType}
          </span>
          {template.industry && (
            <span className="bg-gray-100 px-2 py-1 rounded capitalize">
              {template.industry}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span>Used {template.usageCount} times</span>
          <span>•</span>
          <span>{formatTimeAgo(template.createdAt)}</span>
        </div>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'suggested'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            AI Suggestions
            {suggestedTemplatesWithData.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                {suggestedTemplatesWithData.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Browse All Templates
            <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
              {allTemplates.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'suggested' ? (
        <div className="space-y-4">
          {suggestedTemplatesWithData.length > 0 ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-blue-900">AI-Powered Template Matching</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on your document content, we've found {suggestedTemplatesWithData.length} templates that closely match your needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {suggestedTemplatesWithData.map(({ template, ...suggestion }) =>
                  renderTemplateCard(template!, suggestion)
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No template suggestions yet</h3>
              <p className="text-gray-500 mb-4">
                Upload a document to get AI-powered template recommendations based on content analysis.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Browse All Templates
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {templateTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${selectedType === type
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid */}
          <div className="grid gap-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => renderTemplateCard(template))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first template to get started.'
                  }
                </p>
                {(searchQuery || selectedType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};