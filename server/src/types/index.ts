export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  market_cap: number;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  volume: number;
  created_at: Date;
  updated_at: Date;
}

export interface Investor {
  id: string;
  name: string;
  type: 'politician' | 'investor' | 'executive' | 'high_net_worth';
  country: string;
  position?: string;
  organization?: string;
  party?: string;
  bio?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Trade {
  id: string;
  investor_id: string;
  stock_symbol: string;
  transaction_type: 'buy' | 'sell';
  shares: number;
  price_per_share: number;
  total_value: number;
  transaction_date: Date;
  filing_date: Date;
  source: string;
  source_url?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Portfolio {
  id: string;
  investor_id: string;
  stock_symbol: string;
  shares_owned: number;
  average_cost: number;
  current_value: number;
  total_return: number;
  total_return_percent: number;
  last_updated: Date;
}

export interface BuySuggestion {
  id: string;
  stock_symbol: string;
  confidence_score: number;
  reasoning: string[];
  factors: {
    sentiment_score: number;
    investor_activity: number;
    technical_indicators: number;
    fundamental_analysis: number;
  };
  suggested_price: number;
  target_price: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: Date;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalInvestors: number;
  totalStocks: number;
  totalTrades: number;
  topPerformers: Investor[];
  recentTrades: Trade[];
  marketOverview: {
    gainers: StockPrice[];
    losers: StockPrice[];
    mostActive: StockPrice[];
  };
} 