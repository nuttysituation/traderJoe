import yfinance as yf
import pandas as pd
from typing import Dict, Any, List
import asyncio
import json

class InvestorAnalyzer:
    def __init__(self):
        # Simulated investor data
        self.famous_investors = {
            "Warren Buffett": ["BRK-B", "AAPL", "KO", "BAC"],
            "Bill Gates": ["MSFT", "BRK-B", "CNI", "WM"],
            "Mark Zuckerberg": ["META", "JPM", "V", "MA"],
            "Elon Musk": ["TSLA", "SPACE", "XOM", "CVX"],
            "Cathie Wood": ["TSLA", "COIN", "SQ", "ROKU"]
        }
    
    async def analyze_investor_activity(self, symbol: str) -> Dict[str, Any]:
        """Analyze investor activity for a given stock symbol"""
        try:
            # Get institutional ownership data
            institutional_data = await self._get_institutional_data(symbol)
            
            # Get insider trading data
            insider_data = await self._get_insider_data(symbol)
            
            # Get famous investor activity
            famous_investor_data = await self._get_famous_investor_data(symbol)
            
            # Calculate investor sentiment score
            sentiment_score = self._calculate_investor_sentiment(
                institutional_data, insider_data, famous_investor_data
            )
            
            return {
                "symbol": symbol,
                "institutional_ownership": institutional_data,
                "insider_trading": insider_data,
                "famous_investors": famous_investor_data,
                "investor_sentiment": sentiment_score,
                "confidence": 0.75
            }
        except Exception as e:
            return self._get_default_analysis(symbol, str(e))
    
    async def _get_institutional_data(self, symbol: str) -> Dict[str, Any]:
        """Get institutional ownership data"""
        try:
            # Simulate institutional data
            # In production, this would fetch from SEC filings or financial APIs
            return {
                "total_institutions": 1250,
                "total_shares_held": 850000000,
                "percentage_owned": 45.2,
                "top_holders": [
                    {"name": "Vanguard Group", "shares": 85000000, "percentage": 4.5},
                    {"name": "BlackRock", "shares": 75000000, "percentage": 4.0},
                    {"name": "State Street", "shares": 65000000, "percentage": 3.4}
                ],
                "recent_changes": [
                    {"institution": "Fidelity", "action": "buy", "shares": 5000000},
                    {"institution": "T. Rowe Price", "action": "sell", "shares": 2000000}
                ]
            }
        except Exception:
            return {"error": "Unable to fetch institutional data"}
    
    async def _get_insider_data(self, symbol: str) -> Dict[str, Any]:
        """Get insider trading data"""
        try:
            # Simulate insider trading data
            # In production, this would fetch from SEC Form 4 filings
            return {
                "total_insiders": 15,
                "recent_transactions": [
                    {
                        "insider": "CEO",
                        "action": "buy",
                        "shares": 10000,
                        "date": "2024-01-15",
                        "price": 150.25
                    },
                    {
                        "insider": "CFO",
                        "action": "sell",
                        "shares": 5000,
                        "date": "2024-01-10",
                        "price": 148.75
                    }
                ],
                "net_insider_activity": "positive",
                "confidence": 0.8
            }
        except Exception:
            return {"error": "Unable to fetch insider data"}
    
    async def _get_famous_investor_data(self, symbol: str) -> Dict[str, Any]:
        """Get famous investor activity for the symbol"""
        try:
            interested_investors = []
            
            for investor, holdings in self.famous_investors.items():
                if symbol in holdings:
                    interested_investors.append({
                        "name": investor,
                        "current_position": "hold",
                        "recent_activity": "none",
                        "confidence": 0.9
                    })
            
            return {
                "interested_investors": interested_investors,
                "total_famous_investors": len(interested_investors),
                "sentiment": "positive" if interested_investors else "neutral"
            }
        except Exception:
            return {"error": "Unable to fetch famous investor data"}
    
    def _calculate_investor_sentiment(self, institutional: Dict, insider: Dict, famous: Dict) -> float:
        """Calculate overall investor sentiment score"""
        try:
            score = 0.0
            factors = 0
            
            # Institutional sentiment
            if "recent_changes" in institutional:
                buy_volume = sum(t["shares"] for t in institutional["recent_changes"] if t["action"] == "buy")
                sell_volume = sum(t["shares"] for t in institutional["recent_changes"] if t["action"] == "sell")
                
                if buy_volume + sell_volume > 0:
                    institutional_sentiment = (buy_volume - sell_volume) / (buy_volume + sell_volume)
                    score += institutional_sentiment * 0.4
                    factors += 1
            
            # Insider sentiment
            if "net_insider_activity" in insider:
                insider_sentiment = 0.3 if insider["net_insider_activity"] == "positive" else -0.3
                score += insider_sentiment * 0.3
                factors += 1
            
            # Famous investor sentiment
            if "sentiment" in famous:
                famous_sentiment = 0.2 if famous["sentiment"] == "positive" else -0.2
                score += famous_sentiment * 0.3
                factors += 1
            
            return score / factors if factors > 0 else 0.0
        except Exception:
            return 0.0
    
    def _get_default_analysis(self, symbol: str, error: str = None) -> Dict[str, Any]:
        """Return default analysis when data is unavailable"""
        return {
            "symbol": symbol,
            "institutional_ownership": {},
            "insider_trading": {},
            "famous_investors": {},
            "investor_sentiment": 0.0,
            "confidence": 0.0,
            "error": error or "No data available"
        } 