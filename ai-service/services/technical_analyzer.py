import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import asyncio

class TechnicalAnalyzer:
    def __init__(self):
        pass
    
    async def analyze_technical(self, symbol: str) -> Dict[str, Any]:
        """Analyze technical indicators for a given stock symbol"""
        try:
            # Get historical data
            stock = yf.Ticker(symbol)
            hist = stock.history(period="6mo")
            
            if hist.empty:
                return self._get_default_analysis(symbol)
            
            # Calculate technical indicators
            indicators = {}
            
            # Moving averages
            indicators["sma_20"] = self._calculate_sma(hist, 20)
            indicators["sma_50"] = self._calculate_sma(hist, 50)
            indicators["ema_12"] = self._calculate_ema(hist, 12)
            indicators["ema_26"] = self._calculate_ema(hist, 26)
            
            # RSI
            indicators["rsi"] = self._calculate_rsi(hist)
            
            # MACD
            macd_data = self._calculate_macd(hist)
            indicators["macd"] = macd_data["macd"]
            indicators["macd_signal"] = macd_data["signal"]
            indicators["macd_histogram"] = macd_data["histogram"]
            
            # Bollinger Bands
            bb_data = self._calculate_bollinger_bands(hist)
            indicators["bb_upper"] = bb_data["upper"]
            indicators["bb_middle"] = bb_data["middle"]
            indicators["bb_lower"] = bb_data["lower"]
            
            # Volume analysis
            indicators["volume_sma"] = self._calculate_volume_sma(hist)
            
            # Current price
            current_price = hist['Close'].iloc[-1]
            
            # Generate signals
            signals = self._generate_signals(indicators, current_price)
            
            return {
                "symbol": symbol,
                "current_price": current_price,
                "indicators": indicators,
                "signals": signals,
                "trend": self._determine_trend(indicators),
                "confidence": 0.8
            }
        except Exception as e:
            return self._get_default_analysis(symbol, str(e))
    
    def _calculate_sma(self, data: pd.DataFrame, period: int) -> float:
        """Calculate Simple Moving Average"""
        return data['Close'].rolling(window=period).mean().iloc[-1]
    
    def _calculate_ema(self, data: pd.DataFrame, period: int) -> float:
        """Calculate Exponential Moving Average"""
        return data['Close'].ewm(span=period).mean().iloc[-1]
    
    def _calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1]
    
    def _calculate_macd(self, data: pd.DataFrame) -> Dict[str, float]:
        """Calculate MACD"""
        ema_12 = data['Close'].ewm(span=12).mean()
        ema_26 = data['Close'].ewm(span=26).mean()
        macd = ema_12 - ema_26
        signal = macd.ewm(span=9).mean()
        histogram = macd - signal
        
        return {
            "macd": macd.iloc[-1],
            "signal": signal.iloc[-1],
            "histogram": histogram.iloc[-1]
        }
    
    def _calculate_bollinger_bands(self, data: pd.DataFrame, period: int = 20) -> Dict[str, float]:
        """Calculate Bollinger Bands"""
        sma = data['Close'].rolling(window=period).mean()
        std = data['Close'].rolling(window=period).std()
        
        return {
            "upper": sma.iloc[-1] + (std.iloc[-1] * 2),
            "middle": sma.iloc[-1],
            "lower": sma.iloc[-1] - (std.iloc[-1] * 2)
        }
    
    def _calculate_volume_sma(self, data: pd.DataFrame, period: int = 20) -> float:
        """Calculate Volume Simple Moving Average"""
        return data['Volume'].rolling(window=period).mean().iloc[-1]
    
    def _generate_signals(self, indicators: Dict[str, float], current_price: float) -> Dict[str, str]:
        """Generate trading signals based on indicators"""
        signals = {}
        
        # RSI signals
        rsi = indicators.get("rsi", 50)
        if rsi > 70:
            signals["rsi"] = "overbought"
        elif rsi < 30:
            signals["rsi"] = "oversold"
        else:
            signals["rsi"] = "neutral"
        
        # Moving average signals
        sma_20 = indicators.get("sma_20", current_price)
        sma_50 = indicators.get("sma_50", current_price)
        
        if current_price > sma_20 > sma_50:
            signals["moving_averages"] = "bullish"
        elif current_price < sma_20 < sma_50:
            signals["moving_averages"] = "bearish"
        else:
            signals["moving_averages"] = "neutral"
        
        # MACD signals
        macd = indicators.get("macd", 0)
        macd_signal = indicators.get("macd_signal", 0)
        
        if macd > macd_signal:
            signals["macd"] = "bullish"
        else:
            signals["macd"] = "bearish"
        
        return signals
    
    def _determine_trend(self, indicators: Dict[str, float]) -> str:
        """Determine overall trend"""
        bullish_signals = 0
        bearish_signals = 0
        
        # Count signals
        if indicators.get("rsi", 50) < 30:
            bullish_signals += 1
        elif indicators.get("rsi", 50) > 70:
            bearish_signals += 1
        
        if indicators.get("macd", 0) > indicators.get("macd_signal", 0):
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        if bullish_signals > bearish_signals:
            return "bullish"
        elif bearish_signals > bullish_signals:
            return "bearish"
        else:
            return "neutral"
    
    def _get_default_analysis(self, symbol: str, error: str = None) -> Dict[str, Any]:
        """Return default analysis when data is unavailable"""
        return {
            "symbol": symbol,
            "current_price": 0.0,
            "indicators": {},
            "signals": {},
            "trend": "neutral",
            "confidence": 0.0,
            "error": error or "No data available"
        } 