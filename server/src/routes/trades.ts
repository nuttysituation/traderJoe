import express from 'express';
import { db } from '../config/database';

const router = express.Router();

// Get all trades
router.get('/', async (req, res) => {
  try {
    const { 
      investor_id, 
      stock_symbol, 
      transaction_type, 
      start_date, 
      end_date,
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = db('trades')
      .join('investors', 'trades.investor_id', 'investors.id')
      .join('stocks', 'trades.stock_symbol', 'stocks.symbol')
      .select(
        'trades.*',
        'investors.name as investor_name',
        'investors.type as investor_type',
        'stocks.company_name',
        'stocks.current_price'
      );

    if (investor_id) {
      query = query.where('trades.investor_id', investor_id as string);
    }

    if (stock_symbol) {
      query = query.where('trades.stock_symbol', stock_symbol as string);
    }

    if (transaction_type) {
      query = query.where('trades.transaction_type', transaction_type as string);
    }

    if (start_date) {
      query = query.where('trades.transaction_date', '>=', start_date as string);
    }

    if (end_date) {
      query = query.where('trades.transaction_date', '<=', end_date as string);
    }

    const trades = await query
      .orderBy('trades.transaction_date', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: trades
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trades'
    });
  }
});

// Get trade statistics
router.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = db('trades');

    if (start_date) {
      query = query.where('transaction_date', '>=', start_date as string);
    }

    if (end_date) {
      query = query.where('transaction_date', '<=', end_date as string);
    }

    const [totalTrades] = await query.count('* as count');
    const [totalVolume] = await query.sum('total_value as total');
    const [buyTrades] = await query.where('transaction_type', 'buy').count('* as count');
    const [sellTrades] = await query.where('transaction_type', 'sell').count('* as count');

    // Get top investors by trade volume
    const topInvestors = await db('trades')
      .join('investors', 'trades.investor_id', 'investors.id')
      .select('investors.name', 'investors.type')
      .sum('trades.total_value as total_volume')
      .count('trades.id as trade_count')
      .groupBy('investors.id', 'investors.name', 'investors.type')
      .orderBy('total_volume', 'desc')
      .limit(10);

    // Get most traded stocks
    const mostTradedStocks = await db('trades')
      .join('stocks', 'trades.stock_symbol', 'stocks.symbol')
      .select('stocks.symbol', 'stocks.company_name')
      .sum('trades.total_value as total_volume')
      .count('trades.id as trade_count')
      .groupBy('stocks.symbol', 'stocks.company_name')
      .orderBy('total_volume', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        totalTrades: parseInt(totalTrades.count as string),
        totalVolume: parseFloat(totalVolume.total as string) || 0,
        buyTrades: parseInt(buyTrades.count as string),
        sellTrades: parseInt(sellTrades.count as string),
        topInvestors,
        mostTradedStocks
      }
    });
  } catch (error) {
    console.error('Error fetching trade stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trade statistics'
    });
  }
});

export default router; 