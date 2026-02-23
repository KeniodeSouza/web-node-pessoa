import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const mensagens = error.details.map(d => d.message).join(', ');
            throw { status: 400, message: mensagens };
        }
        
        next();
    };
};
