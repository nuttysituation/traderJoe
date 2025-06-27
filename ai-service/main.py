from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import redis
import json
import os
from dotenv import load_dotenv

from services.sentiment_analyzer import SentimentAnalyzer
from services.technical_analyzer import TechnicalAnalyzer
from services.investor_analyzer import InvestorAnalyzer
from services.buy_suggestion_generator import BuySuggestionGenerator

load_dotenv()

app = FastAPI(title="Stock Tracker AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000", "https://localhost:8766"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
technical_analyzer = TechnicalAnalyzer()
investor_analyzer = InvestorAnalyzer()
buy_suggestion_generator = BuySuggestionGenerator()

# Set analyzers in the suggestion generator
buy_suggestion_generator.set_analyzers(sentiment_analyzer, technical_analyzer, investor_analyzer)

class StockAnalysisRequest(BaseModel):
    symbol: str
    include_sentiment: bool = True
    include_technical: bool = True
    include_investor_activity: bool = True

class BuySuggestionResponse(BaseModel):
    symbol: str
    confidence_score: float
    reasoning: List[str]
    factors: Dict[str, float]
    suggested_price: float
    target_price: float
    risk_level: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-analysis"}

@app.post("/analyze-stock", response_model=Dict[str, Any])
async def analyze_stock(request: StockAnalysisRequest):
    """Analyze a stock using multiple factors"""
    try:
        results = {}
        
        if request.include_sentiment:
            sentiment_score = await sentiment_analyzer.analyze_sentiment(request.symbol)
            results["sentiment"] = sentiment_score
        
        if request.include_technical:
            technical_indicators = await technical_analyzer.analyze_technical(request.symbol)
            results["technical"] = technical_indicators
        
        if request.include_investor_activity:
            investor_activity = await investor_analyzer.analyze_investor_activity(request.symbol)
            results["investor_activity"] = investor_activity
        
        return {
            "symbol": request.symbol,
            "analysis": results,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-buy-suggestions", response_model=List[BuySuggestionResponse])
async def generate_buy_suggestions(background_tasks: BackgroundTasks):
    """Generate buy suggestions for multiple stocks"""
    try:
        # Get tracked stocks from Redis
        tracked_stocks = redis_client.smembers("tracked_stocks")
        if not tracked_stocks:
            # Fallback to default stocks
            tracked_stocks = [b"AAPL", b"GOOGL", b"MSFT", b"TSLA", b"AMZN"]
        
        suggestions = []
        
        for stock_bytes in tracked_stocks[:10]:  # Limit to 10 stocks
            symbol = stock_bytes.decode('utf-8')
            
            # Generate suggestion for each stock
            suggestion = await buy_suggestion_generator.generate_suggestion(symbol)
            if suggestion:
                suggestions.append(suggestion)
        
        # Store suggestions in Redis
        background_tasks.add_task(
            store_suggestions_in_redis,
            suggestions
        )
        
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{symbol}")
async def get_stock_suggestion(symbol: str):
    """Get the latest buy suggestion for a specific stock"""
    try:
        # Try to get from Redis cache first
        cached = redis_client.get(f"suggestion:{symbol}")
        if cached:
            return json.loads(cached)
        
        # Generate new suggestion
        suggestion = await buy_suggestion_generator.generate_suggestion(symbol)
        if suggestion:
            # Cache for 1 hour
            redis_client.setex(
                f"suggestion:{symbol}",
                3600,
                json.dumps(suggestion.dict())
            )
            return suggestion
        
        raise HTTPException(status_code=404, detail="Suggestion not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market-sentiment")
async def get_market_sentiment():
    """Get overall market sentiment"""
    try:
        # Get market sentiment from Redis cache
        cached = redis_client.get("market_sentiment")
        if cached:
            return json.loads(cached)
        
        # Calculate market sentiment
        sentiment = await sentiment_analyzer.get_market_sentiment()
        
        # Cache for 30 minutes
        redis_client.setex(
            "market_sentiment",
            1800,
            json.dumps(sentiment)
        )
        
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def store_suggestions_in_redis(suggestions: List[BuySuggestionResponse]):
    """Store buy suggestions in Redis cache"""
    try:
        for suggestion in suggestions:
            redis_client.setex(
                f"suggestion:{suggestion.symbol}",
                3600,  # 1 hour cache
                json.dumps(suggestion.dict())
            )
    except Exception as e:
        print(f"Error storing suggestions in Redis: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 