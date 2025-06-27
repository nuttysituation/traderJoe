import express from 'express';
import { db } from '../config/database';
import {
  getStockData,
  getCompanyData,
  getSECFilings,
  getMarketNews,
  getMultipleStocks,
  getDataSources
} from '../controllers/stocks';

const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const { sector, industry, limit = 50, offset = 0 } = req.query;

    let query = db('stocks').select('*');

    if (sector) {
      query = query.where('sector', sector as string);
    }

    if (industry) {
      query = query.where('industry', industry as string);
    }

    const stocks = await query
      .orderBy('market_cap', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stocks'
    });
  }
});

// Get stock data for a single symbol
router.get('/:symbol', getStockData);

// Get company information
router.get('/:symbol/company', getCompanyData);

// Get SEC filings
router.get('/:symbol/filings', getSECFilings);

// Get market news
router.get('/:symbol/news', getMarketNews);

// Get data for multiple stocks
router.get('/batch', getMultipleStocks);

// Get available data sources
router.get('/sources', getDataSources);

export default router; 