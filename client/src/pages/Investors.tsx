import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  BuildingOfficeIcon,
  FlagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Investor {
  id: string;
  name: string;
  type: string;
  country: string;
  position: string;
  organization: string;
  party: string | null;
  bio: string;
  image_url: string;
}

const Investors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: Investor[] }>(
    'investors',
    () => fetch('/api/investors').then(res => res.json()),
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
        <p className="text-red-600">Error loading investors data</p>
      </div>
    );
  }

  const investors = response.data;

  // Filter investors based on search and filters
  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || investor.type === typeFilter;
    const matchesCountry = !countryFilter || investor.country === countryFilter;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investor':
        return CurrencyDollarIcon;
      case 'politician':
        return FlagIcon;
      case 'executive':
        return BuildingOfficeIcon;
      default:
        return UserIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investor':
        return 'bg-blue-100 text-blue-800';
      case 'politician':
        return 'bg-red-100 text-red-800';
      case 'executive':
        return 'bg-green-100 text-green-800';
      case 'high_net_worth':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTypes = Array.from(new Set(investors.map(i => i.type)));
  const uniqueCountries = Array.from(new Set(investors.map(i => i.country)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investors & Politicians</h1>
        <p className="text-gray-600">Track the investment activities of famous investors and politicians</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
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

          {/* Country Filter */}
          <div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {filteredInvestors.length} of {investors.length} investors
          </div>
        </div>
      </div>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestors.map((investor, index) => {
          const TypeIcon = getTypeIcon(investor.type);
          
          return (
            <motion.div
              key={investor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/investors/${investor.id}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(investor.type)}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {investor.type.charAt(0).toUpperCase() + investor.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{investor.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">{investor.position}</p>
                    <p className="text-sm text-gray-600">{investor.organization}</p>
                    {investor.party && (
                      <p className="text-sm text-gray-500">{investor.party}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">{investor.bio}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInvestors.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No investors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Investors; 