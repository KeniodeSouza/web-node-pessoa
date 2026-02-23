import { Request, Response, NextFunction } from 'express';

// Este wrapper recebe sua função async e garante que qualquer erro caia no .catch(next)
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
