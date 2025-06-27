import express from 'express';
import { db } from '../config/database';

const router = express.Router();

// Get all investors
router.get('/', async (req, res) => {
  try {
    const { type, country, limit = 50, offset = 0 } = req.query;

    let query = db('investors').select('*');

    if (type) {
      query = query.where('type', type as string);
    }

    if (country) {
      query = query.where('country', country as string);
    }

    const investors = await query
      .orderBy('name', 'asc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: investors
    });
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investors'
    });
  }
});

// Get investor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const investor = await db('investors').where('id', id).first();

    if (!investor) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    // Get investor's recent trades
    const recentTrades = await db('trades')
      .join('stocks', 'trades.stock_symbol', 'stocks.symbol')
      .where('trades.investor_id', id)
      .select(
        'trades.*',
        'stocks.company_name',
        'stocks.current_price'
      )
      .orderBy('trades.transaction_date', 'desc')
      .limit(10);

    // Get investor's portfolio
    const portfolio = await db('portfolios')
      .join('stocks', 'portfolios.stock_symbol', 'stocks.symbol')
      .where('portfolios.investor_id', id)
      .select(
        'portfolios.*',
        'stocks.company_name',
        'stocks.current_price',
        'stocks.price_change_percent'
      )
      .orderBy('portfolios.current_value', 'desc');

    return res.json({
      success: true,
      data: {
        ...investor,
        recentTrades,
        portfolio
      }
    });
  } catch (error) {
    console.error('Error fetching investor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch investor'
    });
  }
});

export default router; 