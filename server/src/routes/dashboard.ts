import express from 'express';
import { db } from '../config/database';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const [totalInvestors] = await db('investors').count('* as count');
    const [totalStocks] = await db('stocks').count('* as count');
    const [totalTrades] = await db('trades').count('* as count');

    // Get recent trades
    const recentTrades = await db('trades')
      .join('investors', 'trades.investor_id', 'investors.id')
      .join('stocks', 'trades.stock_symbol', 'stocks.symbol')
      .select(
        'trades.*',
        'investors.name as investor_name',
        'investors.type as investor_type',
        'stocks.company_name',
        'stocks.current_price'
      )
      .orderBy('trades.transaction_date', 'desc')
      .limit(10);

    // Get top performing stocks
    const topPerformers = await db('stocks')
      .select('*')
      .orderBy('price_change_percent', 'desc')
      .limit(5);

    // Get market overview
    const gainers = await db('stocks')
      .select('*')
      .where('price_change_percent', '>', 0)
      .orderBy('price_change_percent', 'desc')
      .limit(5);

    const losers = await db('stocks')
      .select('*')
      .where('price_change_percent', '<', 0)
      .orderBy('price_change_percent', 'asc')
      .limit(5);

    const mostActive = await db('stocks')
      .select('*')
      .orderBy('volume', 'desc')
      .limit(5);

    res.json({
      success: true,
      data: {
        totalInvestors: parseInt(totalInvestors.count as string),
        totalStocks: parseInt(totalStocks.count as string),
        totalTrades: parseInt(totalTrades.count as string),
        topPerformers,
        recentTrades,
        marketOverview: {
          gainers,
          losers,
          mostActive
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

export default router; 