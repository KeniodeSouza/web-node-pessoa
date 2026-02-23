import { Request, Response, NextFunction } from 'express';

// Definimos o que a nossa resposta tem de especial
export interface CustomResponse extends Response {
  success(data: any, message?: string): void;
}

export function responseHandler(req: Request, res: Response, next: NextFunction) {
  // 2. Define a implementação do método
 (res as CustomResponse).success = (data: any, message = 'Operação realizada com sucesso') => {
    res.json({
      status: 'success',
      message,
      data,
    });
  };

  next();
}
