import { Request, Response } from 'express';
import { dataSourcesService } from '../services/dataSources';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export const getStockData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw createError('Stock symbol is required', 400);
    }

    logger.info(`Fetching stock data for ${symbol}`);
    
    const stockData = await dataSourcesService.getAggregatedStockData(symbol.toUpperCase());
    
    if (!stockData) {
      throw createError(`Stock data not found for ${symbol}`, 404);
    }

    res.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    logger.error(`Error fetching stock data:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data'
    });
  }
};

export const getCompanyData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw createError('Stock symbol is required', 400);
    }

    logger.info(`Fetching company data for ${symbol}`);
    
    const companyData = await dataSourcesService.getAggregatedCompanyData(symbol.toUpperCase());
    
    if (!companyData) {
      throw createError(`Company data not found for ${symbol}`, 404);
    }

    res.json({
      success: true,
      data: companyData
    });
  } catch (error) {
    logger.error(`Error fetching company data:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company data'
    });
  }
};

export const getSECFilings = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw createError('Stock symbol is required', 400);
    }

    logger.info(`Fetching SEC filings for ${symbol}`);
    
    const filings = await dataSourcesService.getSECFilingData(symbol.toUpperCase());

    res.json({
      success: true,
      data: filings
    });
  } catch (error) {
    logger.error(`Error fetching SEC filings:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SEC filings'
    });
  }
};

export const getMarketNews = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw createError('Stock symbol is required', 400);
    }

    logger.info(`Fetching market news for ${symbol}`);
    
    const news = await dataSourcesService.getMarketWatchNews(symbol.toUpperCase());

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    logger.error(`Error fetching market news:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market news'
    });
  }
};

export const getMultipleStocks = async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      throw createError('Stock symbols are required (comma-separated)', 400);
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    
    if (symbolList.length > 10) {
      throw createError('Maximum 10 symbols allowed per request', 400);
    }

    logger.info(`Fetching data for multiple stocks: ${symbolList.join(', ')}`);
    
    const results = await Promise.allSettled(
      symbolList.map(symbol => dataSourcesService.getAggregatedStockData(symbol))
    );

    const stockData = results
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        } else {
          logger.warn(`Failed to fetch data for ${symbolList[index]}`);
          return null;
        }
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: stockData,
      requested: symbolList.length,
      received: stockData.length
    });
  } catch (error) {
    logger.error(`Error fetching multiple stocks:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data'
    });
  }
};

export const getDataSources = async (req: Request, res: Response) => {
  try {
    const sources = [
      {
        name: 'Alpha Vantage',
        status: !!process.env.ALPHA_VANTAGE_API_KEY ? 'Available' : 'Not configured',
        description: 'Stock price data and technical indicators'
      },
      {
        name: 'IEX Cloud',
        status: !!process.env.IEX_CLOUD_API_KEY ? 'Available' : 'Not configured',
        description: 'Real-time stock quotes and market data'
      },
      {
        name: 'Polygon.io',
        status: !!process.env.POLYGON_API_KEY ? 'Available' : 'Not configured',
        description: 'Market data and financial information'
      },
      {
        name: 'Finnhub',
        status: !!process.env.FINNHUB_API_KEY ? 'Available' : 'Not configured',
        description: 'Real-time market data and news'
      },
      {
        name: 'Financial Modeling Prep',
        status: !!process.env.FMP_API_KEY ? 'Available' : 'Not configured',
        description: 'Company profiles and financial data'
      },
      {
        name: 'Open Secrets',
        status: !!process.env.OPEN_SECRETS_API_KEY ? 'Available' : 'Not configured',
        description: 'Political contribution data'
      },
      {
        name: 'Yahoo Finance (Scraping)',
        status: process.env.SCRAPING_ENABLED === 'true' ? 'Available' : 'Disabled',
        description: 'Web scraping for stock data'
      },
      {
        name: 'SEC EDGAR (Scraping)',
        status: process.env.SCRAPING_ENABLED === 'true' ? 'Available' : 'Disabled',
        description: 'SEC filing data via web scraping'
      },
      {
        name: 'MarketWatch (Scraping)',
        status: process.env.SCRAPING_ENABLED === 'true' ? 'Available' : 'Disabled',
        description: 'Financial news via web scraping'
      }
    ];

    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    logger.error(`Error fetching data sources:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data sources'
    });
  }
}; 