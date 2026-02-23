import { Request, Response, NextFunction } from 'express';

export function loggerHandler(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalJson = res.json;

  res.json = function (body: any) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${duration}ms`);
    console.log('Request body:', req.body);
    console.log('Response:', body);
    return originalJson.call(this, body);
  };

  next();
}
