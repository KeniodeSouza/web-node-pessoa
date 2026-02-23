import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Define o status: usa o statusCode do AppError ou 500 (Erro Interno)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Resposta padronizada igual ao seu successHandler
  res.status(statusCode).json({
    status: 'error',
    message,
    // Em desenvolvimento, você pode incluir o stack trace para facilitar o debug
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
