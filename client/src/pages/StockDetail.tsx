import React from 'react';
import { useParams } from 'react-router-dom';

const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Details</h1>
        <p className="text-gray-600">Detailed view for {symbol}</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600">Stock detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default StockDetail; 