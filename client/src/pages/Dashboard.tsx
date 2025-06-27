import React from 'react';
import { useQuery } from 'react-query';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalInvestors: number;
  totalStocks: number;
  totalTrades: number;
  topPerformers: any[];
  recentTrades: any[];
  marketOverview: {
    gainers: any[];
    losers: any[];
    mostActive: any[];
  };
}

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<{ success: boolean; data: DashboardStats }>(
    'dashboard-stats',
    () => fetch('/api/dashboard/stats').then(res => res.json()),
    { refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  }

  const data = stats.data;

  const statCards = [
    {
      name: 'Total Investors',
      value: data.totalInvestors,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Tracked Stocks',
      value: data.totalStocks,
      icon: ChartBarIcon,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Total Trades',
      value: data.totalTrades,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Recent Activity',
      value: data.recentTrades.length,
      icon: ClockIcon,
      color: 'bg-orange-500',
      change: '+3',
      changeType: 'positive'
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Track the latest moves from famous investors and politicians</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 rounded-md ${stat.color} text-white`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{formatNumber(stat.value)}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">{stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by</span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Trades */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Trades</h3>
        </div>
        <div className="overflow-hidden">
          {data.recentTrades.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {data.recentTrades.map((trade, index) => (
                <motion.li
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.transaction_type === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.transaction_type.toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {trade.investor_name} • {trade.stock_symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(trade.shares)} shares @ {formatCurrency(parseFloat(trade.price_per_share))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(trade.total_value))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(trade.transaction_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent trades found
            </div>
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link to="/trades" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
            View all trades
            <EyeIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Gainers</h3>
          </div>
          <div className="overflow-hidden">
            {data.marketOverview.gainers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {data.marketOverview.gainers.map((stock, index) => (
                  <motion.li
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-3 hover:bg-gray-50"
                  >
                    <Link to={`/stocks/${stock.symbol}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.company_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(parseFloat(stock.current_price))}
                          </div>
                          <div className="text-sm text-green-600">
                            +{parseFloat(stock.price_change_percent).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">No gainers found</div>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Losers</h3>
          </div>
          <div className="overflow-hidden">
            {data.marketOverview.losers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {data.marketOverview.losers.map((stock, index) => (
                  <motion.li
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-3 hover:bg-gray-50"
                  >
                    <Link to={`/stocks/${stock.symbol}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.company_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(parseFloat(stock.current_price))}
                          </div>
                          <div className="text-sm text-red-600">
                            {parseFloat(stock.price_change_percent).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">No losers found</div>
            )}
          </div>
        </div>

        {/* Most Active */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Most Active</h3>
          </div>
          <div className="overflow-hidden">
            {data.marketOverview.mostActive.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {data.marketOverview.mostActive.map((stock, index) => (
                  <motion.li
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-3 hover:bg-gray-50"
                  >
                    <Link to={`/stocks/${stock.symbol}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.company_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(parseFloat(stock.current_price))}
                          </div>
                          <div className="text-sm text-gray-500">
                            Vol: {formatNumber(parseInt(stock.volume))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">No active stocks found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 