import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface BuySuggestion {
  id: string;
  stock_symbol: string;
  confidence_score: number;
  reasoning: string[];
  factors: any;
  suggested_price: number;
  target_price: number;
  risk_level: string;
  created_at: string;
}

const Analysis: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState('');

  const { data: suggestions, isLoading, error } = useQuery<{ success: boolean; data: BuySuggestion[] }>(
    'buy-suggestions',
    () => fetch('/api/analysis/suggestions').then(res => res.json()),
    { refetchInterval: 300000 } // 5 minutes
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !suggestions?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading analysis data</p>
      </div>
    );
  }

  const data = suggestions.data || [];

  // Filter by risk level
  const filteredSuggestions = selectedRisk 
    ? data.filter(s => s.risk_level === selectedRisk)
    : data;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueRiskLevels = Array.from(new Set(data.map(s => s.risk_level)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Analysis</h1>
        <p className="text-gray-600">AI-powered buy suggestions and market analysis</p>
      </div>

      {/* Risk Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Risk Level Filter</h3>
            <p className="text-sm text-gray-500">Filter suggestions by risk level</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedRisk('')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedRisk === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {uniqueRiskLevels.map(risk => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedRisk === risk 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Buy Suggestions */}
      <div className="space-y-4">
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <LightBulbIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/stocks/${suggestion.stock_symbol}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600"
                        >
                          {suggestion.stock_symbol}
                        </Link>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(suggestion.risk_level)}`}>
                          {suggestion.risk_level.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Analysis generated {formatDate(suggestion.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getConfidenceColor(suggestion.confidence_score)}`}>
                      {(suggestion.confidence_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500">Confidence</div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Suggested Price</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(suggestion.suggested_price)}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600">Target Price</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {formatCurrency(suggestion.target_price)}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600">Potential Return</div>
                    <div className="text-lg font-semibold text-green-900">
                      {((suggestion.target_price - suggestion.suggested_price) / suggestion.suggested_price * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">AI Reasoning</h4>
                  <div className="space-y-2">
                    {suggestion.reasoning.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Factors */}
                {suggestion.factors && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Factors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(suggestion.factors).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{key}</span>
                          <span className="text-sm text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                      View Stock Details
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      Technical Analysis
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    Updated {formatDate(suggestion.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No buy suggestions available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedRisk 
                ? `No ${selectedRisk} risk suggestions found. Try selecting a different risk level.`
                : 'AI analysis is being generated. Check back soon for buy suggestions.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Investment Disclaimer</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This analysis is for informational purposes only and should not be considered as investment advice. 
                Always conduct your own research and consult with a financial advisor before making investment decisions. 
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis; 