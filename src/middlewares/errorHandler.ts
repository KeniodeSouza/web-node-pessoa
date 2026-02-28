import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Funcao: Captura dos erros no aplicação
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Erros manipulados:
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      data: undefined
    });
  }

  // Erros de sistema incontrolados
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    data: undefined,
    // Em desenvolvimento, você pode incluir o stack trace para facilitar o debug
    stack: process.env.APP_ENV === 'development' ? err.stack : undefined,
  });
}