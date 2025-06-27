import yfinance as yf
import requests
from textblob import TextBlob
import nltk
from typing import Dict, Any, List
import asyncio
import json

class SentimentAnalyzer:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            nltk.download('vader_lexicon', quiet=True)
        
        # Initialize VADER analyzer if available
        try:
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            self.vader = SentimentIntensityAnalyzer()
        except ImportError:
            self.vader = None
            print("VADER sentiment analyzer not available, using TextBlob only")
    
    async def analyze_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Analyze sentiment for a given stock symbol"""
        try:
            # Get stock news and social media sentiment
            news_sentiment = await self._get_news_sentiment(symbol)
            social_sentiment = await self._get_social_sentiment(symbol)
            
            # Calculate weighted sentiment score
            weighted_score = (news_sentiment * 0.6) + (social_sentiment * 0.4)
            
            return {
                "symbol": symbol,
                "overall_sentiment": weighted_score,
                "news_sentiment": news_sentiment,
                "social_sentiment": social_sentiment,
                "sentiment_label": self._get_sentiment_label(weighted_score),
                "confidence": 0.85
            }
        except Exception as e:
            return {
                "symbol": symbol,
                "overall_sentiment": 0.0,
                "news_sentiment": 0.0,
                "social_sentiment": 0.0,
                "sentiment_label": "neutral",
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def _get_news_sentiment(self, symbol: str) -> float:
        """Get sentiment from news articles"""
        try:
            # Simulate news sentiment analysis
            # In production, this would fetch real news articles
            sample_texts = [
                f"{symbol} shows strong quarterly performance",
                f"Analysts bullish on {symbol} future prospects",
                f"{symbol} faces market challenges",
                f"Investors optimistic about {symbol} growth"
            ]
            
            sentiments = []
            for text in sample_texts:
                blob = TextBlob(text)
                sentiments.append(blob.sentiment.polarity)
            
            return sum(sentiments) / len(sentiments) if sentiments else 0.0
        except Exception:
            return 0.0
    
    async def _get_social_sentiment(self, symbol: str) -> float:
        """Get sentiment from social media"""
        try:
            # Simulate social media sentiment
            # In production, this would analyze Twitter, Reddit, etc.
            sample_tweets = [
                f"$SYMBOL looking good today!",
                f"Not sure about $SYMBOL anymore",
                f"$SYMBOL to the moon!",
                f"$SYMBOL earnings beat expectations"
            ]
            
            sentiments = []
            for tweet in sample_tweets:
                tweet = tweet.replace("$SYMBOL", symbol)
                blob = TextBlob(tweet)
                sentiments.append(blob.sentiment.polarity)
            
            return sum(sentiments) / len(sentiments) if sentiments else 0.0
        except Exception:
            return 0.0
    
    def _get_sentiment_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score >= 0.2:
            return "positive"
        elif score <= -0.2:
            return "negative"
        else:
            return "neutral"
    
    async def get_market_sentiment(self) -> Dict[str, Any]:
        """Get overall market sentiment"""
        try:
            # Analyze major indices
            indices = ["^GSPC", "^DJI", "^IXIC"]  # S&P 500, Dow Jones, NASDAQ
            sentiments = []
            
            for index in indices:
                sentiment = await self.analyze_sentiment(index)
                sentiments.append(sentiment["overall_sentiment"])
            
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0
            
            return {
                "market_sentiment": avg_sentiment,
                "sentiment_label": self._get_sentiment_label(avg_sentiment),
                "confidence": 0.8,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        except Exception as e:
            return {
                "market_sentiment": 0.0,
                "sentiment_label": "neutral",
                "confidence": 0.0,
                "error": str(e)
            } 