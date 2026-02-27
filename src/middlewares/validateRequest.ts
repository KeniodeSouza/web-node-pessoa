import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

// Adicionamos um parâmetro para definir o alvo da validação (body, params ou query)
export const validateRequest = (schema: Schema, property: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Acessamos dinamicamente req[property]
        const { error } = schema.validate(req[property], { 
                                abortEarly: false,
                                allowUnknown: false // Se true, ignora campos extras (cuidado!)
                            });
        
        if (error) {
            const mensagens = error.details.map(d => d.message).join(', ');
            // Usando return para evitar que o código continue após o erro
            return next({ status: 400, message: mensagens });
        }
        
        next();
    };
};
