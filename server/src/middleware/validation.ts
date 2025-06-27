import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schemas
const stockQuerySchema = Joi.object({
  symbol: Joi.string().pattern(/^[A-Z]{1,5}$/).optional(),
  sector: Joi.string().max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1)
});

const investorQuerySchema = Joi.object({
  type: Joi.string().valid('politician', 'investor', 'executive', 'high_net_worth').optional(),
  country: Joi.string().max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1)
});

const tradeQuerySchema = Joi.object({
  investor_id: Joi.string().uuid().optional(),
  stock_symbol: Joi.string().pattern(/^[A-Z]{1,5}$/).optional(),
  transaction_type: Joi.string().valid('buy', 'sell').optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1)
});

const analysisQuerySchema = Joi.object({
  risk_level: Joi.string().valid('low', 'medium', 'high').optional(),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// Generic validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    req.query = value;
    next();
  };
};

// Specific validation middlewares
export const validateStockQuery = validateQuery(stockQuerySchema);
export const validateInvestorQuery = validateQuery(investorQuerySchema);
export const validateTradeQuery = validateQuery(tradeQuerySchema);
export const validateAnalysisQuery = validateQuery(analysisQuerySchema);

// Request size limiting
export const validateRequestSize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        success: false,
        error: 'Request entity too large',
        maxSize: maxSize
      });
      return;
    }
    
    next();
  };
};

// Parse size string to bytes
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'mb';
  
  return value * units[unit];
}

// Sanitize input strings
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  next();
};

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

function sanitizeObject(obj: any): void {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
} 