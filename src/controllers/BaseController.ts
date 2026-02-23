import { Request, Response, NextFunction } from 'express';
import { Repository, EntityTarget } from 'typeorm';
import { AppDataSource } from '../db/data-source';
/*
export abstract class BaseController<T> {
    protected repository: Repository<T>;

    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    // Listar todos (com suporte a paginação simples via Query Params)
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.repository.find();
            return res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // Obter um registro por ID (via Param)
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as any;
            const result = await this.repository.findOneBy(id);
            
            if (!result) {
                return res.status(404).json({ message: 'Registro não encontrado' });
            }
            
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // Deletar registro
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as any;
            await this.repository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
    
}
*/
