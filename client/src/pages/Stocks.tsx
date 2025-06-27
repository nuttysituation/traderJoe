import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  market_cap: string;
  current_price: string;
  price_change: string;
  price_change_percent: string;
  volume: string;
}

const Stocks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');

  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: Stock[] }>(
    'stocks',
    () => fetch('/api/stocks').then(res => res.json()),
    { refetchInterval: 30000 }
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
        <p className="text-red-600">Error loading stocks data</p>
      </div>
    );
  }

  const stocks = response.data;

  // Filter and sort stocks
  const filteredStocks = stocks
    .filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = !sectorFilter || stock.sector === sectorFilter;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'market_cap':
          return parseInt(b.market_cap) - parseInt(a.market_cap);
        case 'price':
          return parseFloat(b.current_price) - parseFloat(a.current_price);
        case 'change':
          return parseFloat(b.price_change_percent) - parseFloat(a.price_change_percent);
        case 'volume':
          return parseInt(b.volume) - parseInt(a.volume);
        default:
          return 0;
      }
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMarketCap = (value: string) => {
    const num = parseInt(value);
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(1)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(1)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatNumber = (value: string) => {
    return new Intl.NumberFormat('en-US').format(parseInt(value));
  };

  const uniqueSectors = Array.from(new Set(stocks.map(s => s.sector)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stocks</h1>
        <p className="text-gray-600">Track stock prices and market performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sectors</option>
              {uniqueSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="market_cap">Market Cap</option>
              <option value="price">Price</option>
              <option value="change">Change %</option>
              <option value="volume">Volume</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {filteredStocks.length} of {stocks.length} stocks
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock, index) => {
                const priceChange = parseFloat(stock.price_change_percent);
                const isPositive = priceChange >= 0;
                
                return (
                  <motion.tr
                    key={stock.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/stocks/${stock.symbol}`} className="block">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <ChartBarIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                            <div className="text-sm text-gray-500">{stock.company_name}</div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stock.sector}</div>
                      <div className="text-sm text-gray-500">{stock.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(stock.current_price))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`flex items-center justify-end text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(parseFloat(stock.price_change))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMarketCap(stock.market_cap)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatNumber(stock.volume)}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stocks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Stocks; 