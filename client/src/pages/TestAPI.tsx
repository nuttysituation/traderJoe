import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';

const TestAPI: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [testSymbol, setTestSymbol] = useState('');

  const { data: stockData, isLoading, error, refetch } = useQuery(
    ['stock-data', symbol],
    () => fetch(`/api/stocks/${symbol}`).then(res => res.json()),
    {
      enabled: false, // Don't auto-fetch
      refetchOnWindowFocus: false,
    }
  );

  const { data: sources } = useQuery(
    'data-sources',
    () => fetch('/api/stocks/sources').then(res => res.json()),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleTest = () => {
    if (testSymbol) {
      setSymbol(testSymbol.toUpperCase());
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Test Page</h1>
        <p className="text-gray-600">Test the Alpha Vantage and other data sources integration</p>
      </div>

      {/* Data Sources Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Data Sources Status</h3>
        </div>
        <div className="card-body">
          {sources?.data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.data.map((source: any, index: number) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    source.status === 'Available' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <p className={`text-sm ${
                    source.status === 'Available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {source.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Loading data sources...</p>
          )}
        </div>
      </div>

      {/* Stock Data Test */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Stock Data Test</h3>
        </div>
        <div className="card-body">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={testSymbol}
              onChange={(e) => setTestSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="input flex-1"
            />
            <button
              onClick={handleTest}
              disabled={!testSymbol || isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Loading...' : 'Test'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600">Error: {(error as any)?.message || 'Unknown error occurred'}</p>
            </div>
          )}

          {stockData?.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-2">Stock Data for {stockData.data.symbol}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Price:</span>
                  <p className="font-medium">${stockData.data.price?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Change:</span>
                  <p className={`font-medium ${
                    stockData.data.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockData.data.change >= 0 ? '+' : ''}{stockData.data.change?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Change %:</span>
                  <p className={`font-medium ${
                    stockData.data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockData.data.changePercent >= 0 ? '+' : ''}{stockData.data.changePercent?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Volume:</span>
                  <p className="font-medium">{stockData.data.volume?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Source:</span>
                  <p className="font-medium">{stockData.data.source}</p>
                </div>
                <div>
                  <span className="text-gray-500">Timestamp:</span>
                  <p className="font-medium">{new Date(stockData.data.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Raw JSON Data */}
          {stockData && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View Raw JSON Data
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto">
                {JSON.stringify(stockData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Quick Test Buttons */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Tests</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-2">
            {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'].map((testSymbol) => (
              <button
                key={testSymbol}
                onClick={() => {
                  setSymbol(testSymbol);
                  setTestSymbol(testSymbol);
                  refetch();
                }}
                className="btn-secondary text-sm"
              >
                Test {testSymbol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAPI; 