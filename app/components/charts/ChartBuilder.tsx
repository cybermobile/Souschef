import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  values: any[];
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  aggregation?: 'sum' | 'average' | 'count' | 'max' | 'min';
  showLegend: boolean;
  colorScheme: 'default' | 'blue' | 'green' | 'red' | 'purple' | 'warm' | 'cool';
}

interface ChartBuilderProps {
  data: DataColumn[];
  onConfigChange: (config: ChartConfig) => void;
  onChartGenerate: (chartData: any, options: any) => void;
  className?: string;
}

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: '📈', description: 'Best for trends over time' },
  { value: 'bar', label: 'Bar Chart', icon: '📊', description: 'Best for comparing categories' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧', description: 'Best for showing parts of a whole' },
  { value: 'doughnut', label: 'Doughnut Chart', icon: '🍩', description: 'Modern pie chart alternative' },
];

const colorSchemes = {
  default: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'],
  blue: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#BFDBFE'],
  green: ['#047857', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  red: ['#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  purple: ['#6B21A8', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  warm: ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A'],
  cool: ['#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED', '#A21CAF'],
};

export const ChartBuilder: React.FC<ChartBuilderProps> = ({
  data,
  onConfigChange,
  onChartGenerate,
  className = '',
}) => {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'Chart Title',
    showLegend: true,
    colorScheme: 'default',
    aggregation: 'sum',
  });

  const numericColumns = useMemo(() => data.filter(col => col.type === 'number'), [data]);
  const categoricalColumns = useMemo(() => data.filter(col => col.type === 'string'), [data]);
  const dateColumns = useMemo(() => data.filter(col => col.type === 'date'), [data]);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const generateChartData = useMemo(() => {
    if (!config.xAxis || !config.yAxis) return null;

    const xColumn = data.find(col => col.name === config.xAxis);
    const yColumn = data.find(col => col.name === config.yAxis);

    if (!xColumn || !yColumn) return null;

    const colors = colorSchemes[config.colorScheme];

    if (config.type === 'pie' || config.type === 'doughnut') {
      // For pie charts, aggregate data by categories
      const aggregated: { [key: string]: number } = {};

      xColumn.values.forEach((category, index) => {
        const value = Number(yColumn.values[index]) || 0;
        if (aggregated[category]) {
          aggregated[category] += value;
        } else {
          aggregated[category] = value;
        }
      });

      return {
        labels: Object.keys(aggregated),
        datasets: [{
          data: Object.values(aggregated),
          backgroundColor: colors,
          borderColor: colors.map(color => color + 'CC'),
          borderWidth: 2,
        }],
      };
    } else {
      // For line and bar charts
      const labels = [...new Set(xColumn.values)].sort();
      const dataPoints: number[] = [];

      labels.forEach(label => {
        const indices = xColumn.values
          .map((value, index) => value === label ? index : -1)
          .filter(index => index !== -1);

        const values = indices.map(index => Number(yColumn.values[index]) || 0);

        let aggregatedValue: number;
        switch (config.aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'average':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'count':
            aggregatedValue = values.length;
            break;
          case 'max':
            aggregatedValue = Math.max(...values);
            break;
          case 'min':
            aggregatedValue = Math.min(...values);
            break;
          default:
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        }

        dataPoints.push(aggregatedValue);
      });

      return {
        labels,
        datasets: [{
          label: `${config.aggregation} of ${config.yAxis}`,
          data: dataPoints,
          backgroundColor: config.type === 'line' ? colors[0] + '20' : colors[0],
          borderColor: colors[0],
          borderWidth: 2,
          fill: config.type === 'line' ? false : true,
        }],
      };
    }
  }, [data, config]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: config.showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!config.title,
        text: config.title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: (config.type === 'line' || config.type === 'bar') ? {
      x: {
        title: {
          display: !!config.xAxis,
          text: config.xAxis,
        },
      },
      y: {
        title: {
          display: !!config.yAxis,
          text: `${config.aggregation} of ${config.yAxis}`,
        },
      },
    } : undefined,
  }), [config]);

  const renderChart = () => {
    if (!generateChartData) return null;

    const commonProps = {
      data: generateChartData,
      options: chartOptions,
    };

    switch (config.type) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return null;
    }
  };

  const handleGenerate = () => {
    if (generateChartData) {
      onChartGenerate(generateChartData, chartOptions);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Chart Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateConfig({ type: type.value as ChartConfig['type'] })}
              className={`
                p-3 border rounded-lg text-left transition-all
                ${config.type === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-lg mb-1">{type.icon}</div>
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Basic Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter chart title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
            <select
              value={config.xAxis || ''}
              onChange={(e) => updateConfig({ xAxis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select column...</option>
              {[...categoricalColumns, ...dateColumns].map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
            <select
              value={config.yAxis || ''}
              onChange={(e) => updateConfig({ yAxis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select column...</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </select>
          </div>

          {(config.type === 'line' || config.type === 'bar') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation</label>
              <select
                value={config.aggregation}
                onChange={(e) => updateConfig({ aggregation: e.target.value as ChartConfig['aggregation'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sum">Sum</option>
                <option value="average">Average</option>
                <option value="count">Count</option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
              </select>
            </div>
          )}
        </div>

        {/* Style Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Style Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(colorSchemes).map(([key, colors]) => (
                <button
                  key={key}
                  onClick={() => updateConfig({ colorScheme: key as ChartConfig['colorScheme'] })}
                  className={`
                    p-2 border rounded-md transition-all
                    ${config.colorScheme === key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex space-x-1 mb-1">
                    {colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{key}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLegend"
              checked={config.showLegend}
              onChange={(e) => updateConfig({ showLegend: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showLegend" className="ml-2 block text-sm text-gray-700">
              Show Legend
            </label>
          </div>
        </div>
      </div>

      {/* Chart Preview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Preview</h3>
          <button
            onClick={handleGenerate}
            disabled={!config.xAxis || !config.yAxis}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Chart
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          {generateChartData ? (
            <div className="max-w-full max-h-96">
              {renderChart()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">Select X and Y axes to see chart preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};