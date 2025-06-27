from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import asyncio
import yfinance as yf

class BuySuggestionResponse(BaseModel):
    symbol: str
    confidence_score: float
    reasoning: List[str]
    factors: Dict[str, float]
    suggested_price: float
    target_price: float
    risk_level: str

class BuySuggestionGenerator:
    def __init__(self):
        self.sentiment_analyzer = None
        self.technical_analyzer = None
        self.investor_analyzer = None
    
    def set_analyzers(self, sentiment_analyzer, technical_analyzer, investor_analyzer):
        """Set the analyzer instances"""
        self.sentiment_analyzer = sentiment_analyzer
        self.technical_analyzer = technical_analyzer
        self.investor_analyzer = investor_analyzer
    
    async def generate_suggestion(self, symbol: str) -> Optional[BuySuggestionResponse]:
        """Generate a buy/sell suggestion for a given stock symbol"""
        try:
            # Get current stock price
            current_price = await self._get_current_price(symbol)
            if not current_price:
                return None
            
            # Collect analysis from all analyzers
            analyses = {}
            
            if self.sentiment_analyzer:
                analyses["sentiment"] = await self.sentiment_analyzer.analyze_sentiment(symbol)
            
            if self.technical_analyzer:
                analyses["technical"] = await self.technical_analyzer.analyze_technical(symbol)
            
            if self.investor_analyzer:
                analyses["investor"] = await self.investor_analyzer.analyze_investor_activity(symbol)
            
            # Calculate overall confidence and factors
            confidence_score, factors = self._calculate_confidence(analyses)
            
            # Generate reasoning
            reasoning = self._generate_reasoning(analyses, factors)
            
            # Calculate suggested and target prices
            suggested_price, target_price = self._calculate_prices(current_price, analyses)
            
            # Determine risk level
            risk_level = self._determine_risk_level(analyses, confidence_score)
            
            return BuySuggestionResponse(
                symbol=symbol,
                confidence_score=confidence_score,
                reasoning=reasoning,
                factors=factors,
                suggested_price=suggested_price,
                target_price=target_price,
                risk_level=risk_level
            )
        except Exception as e:
            print(f"Error generating suggestion for {symbol}: {e}")
            return None
    
    async def _get_current_price(self, symbol: str) -> Optional[float]:
        """Get current stock price"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            return info.get('currentPrice', info.get('regularMarketPrice', None))
        except Exception:
            return None
    
    def _calculate_confidence(self, analyses: Dict[str, Any]) -> tuple[float, Dict[str, float]]:
        """Calculate overall confidence score and individual factors"""
        factors = {}
        total_weight = 0
        weighted_sum = 0
        
        # Sentiment factor (30% weight)
        if "sentiment" in analyses:
            sentiment_score = analyses["sentiment"].get("overall_sentiment", 0)
            factors["sentiment"] = (sentiment_score + 1) / 2  # Convert from [-1,1] to [0,1]
            weighted_sum += factors["sentiment"] * 0.3
            total_weight += 0.3
        
        # Technical factor (40% weight)
        if "technical" in analyses:
            technical_conf = analyses["technical"].get("confidence", 0)
            trend_score = 0.5  # neutral
            if analyses["technical"].get("trend") == "bullish":
                trend_score = 0.8
            elif analyses["technical"].get("trend") == "bearish":
                trend_score = 0.2
            
            factors["technical"] = (technical_conf + trend_score) / 2
            weighted_sum += factors["technical"] * 0.4
            total_weight += 0.4
        
        # Investor factor (30% weight)
        if "investor" in analyses:
            investor_sentiment = analyses["investor"].get("investor_sentiment", 0)
            factors["investor"] = (investor_sentiment + 1) / 2  # Convert from [-1,1] to [0,1]
            weighted_sum += factors["investor"] * 0.3
            total_weight += 0.3
        
        # Calculate overall confidence
        overall_confidence = weighted_sum / total_weight if total_weight > 0 else 0.5
        
        return overall_confidence, factors
    
    def _generate_reasoning(self, analyses: Dict[str, Any], factors: Dict[str, float]) -> List[str]:
        """Generate reasoning for the suggestion"""
        reasoning = []
        
        # Sentiment reasoning
        if "sentiment" in analyses:
            sentiment = analyses["sentiment"]
            if sentiment.get("overall_sentiment", 0) > 0.2:
                reasoning.append("Positive market sentiment and news coverage")
            elif sentiment.get("overall_sentiment", 0) < -0.2:
                reasoning.append("Negative market sentiment and news coverage")
            else:
                reasoning.append("Neutral market sentiment")
        
        # Technical reasoning
        if "technical" in analyses:
            technical = analyses["technical"]
            trend = technical.get("trend", "neutral")
            if trend == "bullish":
                reasoning.append("Strong technical indicators showing bullish trend")
            elif trend == "bearish":
                reasoning.append("Technical indicators suggest bearish trend")
            else:
                reasoning.append("Mixed technical signals")
        
        # Investor reasoning
        if "investor" in analyses:
            investor = analyses["investor"]
            investor_sentiment = investor.get("investor_sentiment", 0)
            if investor_sentiment > 0.2:
                reasoning.append("Positive institutional and insider activity")
            elif investor_sentiment < -0.2:
                reasoning.append("Negative institutional and insider activity")
            else:
                reasoning.append("Neutral investor activity")
        
        return reasoning
    
    def _calculate_prices(self, current_price: float, analyses: Dict[str, Any]) -> tuple[float, float]:
        """Calculate suggested entry price and target price"""
        # Base calculations on technical analysis if available
        if "technical" in analyses:
            technical = analyses["technical"]
            
            # Use Bollinger Bands for suggested price
            bb_lower = technical.get("indicators", {}).get("bb_lower", current_price * 0.95)
            bb_upper = technical.get("indicators", {}).get("bb_upper", current_price * 1.05)
            
            # Suggested price based on trend
            trend = technical.get("trend", "neutral")
            if trend == "bullish":
                suggested_price = current_price * 0.98  # Slight discount for entry
                target_price = bb_upper * 1.05  # 5% above upper band
            elif trend == "bearish":
                suggested_price = current_price * 1.02  # Slight premium for entry
                target_price = bb_lower * 0.95  # 5% below lower band
            else:
                suggested_price = current_price
                target_price = current_price * 1.1  # 10% target
        else:
            # Default calculations
            suggested_price = current_price
            target_price = current_price * 1.1
        
        return suggested_price, target_price
    
    def _determine_risk_level(self, analyses: Dict[str, Any], confidence: float) -> str:
        """Determine risk level based on analysis"""
        risk_factors = 0
        
        # Check technical volatility
        if "technical" in analyses:
            technical = analyses["technical"]
            rsi = technical.get("indicators", {}).get("rsi", 50)
            if rsi > 70 or rsi < 30:
                risk_factors += 1
        
        # Check sentiment volatility
        if "sentiment" in analyses:
            sentiment = analyses["sentiment"]
            if abs(sentiment.get("overall_sentiment", 0)) > 0.5:
                risk_factors += 1
        
        # Check confidence
        if confidence < 0.4:
            risk_factors += 2
        elif confidence < 0.6:
            risk_factors += 1
        
        # Determine risk level
        if risk_factors >= 3:
            return "high"
        elif risk_factors >= 1:
            return "medium"
        else:
            return "low" 