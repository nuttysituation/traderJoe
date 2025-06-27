-- Create stocks table
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    current_price DECIMAL(10,2),
    price_change DECIMAL(10,2),
    price_change_percent DECIMAL(5,2),
    volume BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create investors table
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('politician', 'investor', 'executive', 'high_net_worth')),
    country VARCHAR(100) NOT NULL,
    position VARCHAR(255),
    organization VARCHAR(255),
    party VARCHAR(100),
    net_worth BIGINT,
    bio TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
    shares INTEGER NOT NULL,
    price_per_share DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    filing_date DATE NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    shares_owned INTEGER NOT NULL DEFAULT 0,
    average_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_return DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_return_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(investor_id, stock_symbol)
);

-- Create buy_suggestions table
CREATE TABLE buy_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning TEXT[] NOT NULL,
    factors JSONB NOT NULL,
    suggested_price DECIMAL(10,2) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_prices table for historical data
CREATE TABLE stock_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    price DECIMAL(10,2) NOT NULL,
    change DECIMAL(10,2) NOT NULL,
    change_percent DECIMAL(5,2) NOT NULL,
    volume BIGINT NOT NULL,
    market_cap BIGINT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_investors_country ON investors(country);
CREATE INDEX idx_trades_investor_id ON trades(investor_id);
CREATE INDEX idx_trades_stock_symbol ON trades(stock_symbol);
CREATE INDEX idx_trades_transaction_date ON trades(transaction_date);
CREATE INDEX idx_trades_source ON trades(source);
CREATE INDEX idx_portfolios_investor_id ON portfolios(investor_id);
CREATE INDEX idx_portfolios_stock_symbol ON portfolios(stock_symbol);
CREATE INDEX idx_buy_suggestions_stock_symbol ON buy_suggestions(stock_symbol);
CREATE INDEX idx_buy_suggestions_created_at ON buy_suggestions(created_at);
CREATE INDEX idx_stock_prices_symbol_timestamp ON stock_prices(symbol, timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 