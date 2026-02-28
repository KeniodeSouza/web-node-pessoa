import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';
import { AppError } from '../errors/AppError';

// Adicionamos um parâmetro para definir o alvo da validação (body, params ou query)
export const validateRequest = (schema: Schema, property: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Acessamos dinamicamente req[property]
        const { error } = schema.validate(req[property], {
                                abortEarly: false,  // Captura todos os erros, não apenas o primeiro
                                allowUnknown: true, // Permite campos extras não validados
                                stripUnknown: true, // Remove campos que não estão no schema             
                            });

        if (error) {
            // Une todas as mensagens de erro em uma string legível
            const errorMessage = error.details
                                        .map((detail) => detail.message.replace(/['"]/g, ''))
                                        .join(', ');

            // Lançamos o AppError para que o seu errorHandler o capture
            throw new AppError(errorMessage, 400);
        }
        
        next();
    };
    
};
