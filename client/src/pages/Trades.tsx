import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Trade {
  id: string;
  investor_name: string;
  investor_type: string;
  stock_symbol: string;
  company_name: string;
  transaction_type: string;
  shares: number;
  price_per_share: string;
  total_value: string;
  transaction_date: string;
  filing_date: string;
  source: string;
  current_price: string;
}

const Trades: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('');

  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: Trade[] }>(
    'trades',
    () => fetch('/api/trades').then(res => res.json()),
    { refetchInterval: 60000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !response?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading trades data</p>
      </div>
    );
  }

  const trades = response.data;

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.stock_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || trade.investor_type === typeFilter;
    const matchesTransaction = !transactionFilter || trade.transaction_type === transactionFilter;
    
    return matchesSearch && matchesType && matchesTransaction;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const uniqueTypes = Array.from(new Set(trades.map(t => t.investor_type)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trades</h1>
        <p className="text-gray-600">Track recent stock trades by famous investors and politicians</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Investor Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Transactions</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {filteredTrades.length} of {trades.length} trades
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="space-y-4">
        {filteredTrades.map((trade, index) => {
          const isBuy = trade.transaction_type === 'buy';
          const currentPrice = parseFloat(trade.current_price);
          const tradePrice = parseFloat(trade.price_per_share);
          const priceChange = currentPrice - tradePrice;
          const priceChangePercent = (priceChange / tradePrice) * 100;
          
          return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left side - Investor and Stock */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {trade.transaction_type.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/investors/${trade.investor_name}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {trade.investor_name}
                          </Link>
                          <span className="text-sm text-gray-500">•</span>
                          <Link 
                            to={`/stocks/${trade.stock_symbol}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {trade.stock_symbol}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {trade.company_name} • {trade.investor_type.charAt(0).toUpperCase() + trade.investor_type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Trade Details */}
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-4">
                      {/* Trade Details */}
                      <div>
                        <div className="text-sm text-gray-500">Shares</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(trade.shares)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(tradePrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(parseFloat(trade.total_value))}
                        </div>
                      </div>
                    </div>

                    {/* Price Change Since Trade */}
                    <div className="mt-2 flex items-center justify-end">
                      <div className={`flex items-center text-sm font-medium ${
                        priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {priceChange >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}% since trade
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-2 flex items-center justify-end text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(trade.transaction_date)} • Filed {formatDate(trade.filing_date)}
                    </div>
                  </div>
                </div>

                {/* Source */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Source: {trade.source}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTrades.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trades found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Trades; 