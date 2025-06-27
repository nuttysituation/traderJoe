import React from 'react';
import { useParams } from 'react-router-dom';

const InvestorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investor Details</h1>
        <p className="text-gray-600">Detailed view for investor ID: {id}</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600">Investor detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorDetail; 